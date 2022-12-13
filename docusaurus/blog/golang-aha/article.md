---
authors: plorenz
---

# Golang Aha! Moments

## Introduction
As we (the OpenZiti team) progressed on our Go journey, we've stumbled on various
obstacles, settled on some best practices and hopefully gotten better at writing Go
code. This document is meant to share some of the 'Aha!' moments where we overcame 
stumbling blocks and found solutions that sparked joy. 
This is intended both for new team members and for anyone in the go community who 
might be interested. We'd be very happy to hear from others about their own 'aha'
moments and also how the solutions presented strike your sensibilities.

## Channels
Channels are a core feature of go. As is typical of go, the channel API is small and
simple, but provides a lot of power. 

If you haven't read it yet, Dave Cheney's [Channel Axioms](https://dave.cheney.net/2014/03/19/channel-axioms)
 is worth a look.

## Closing Channels
Closing channels can be complicated. On the reader side things are generally uncomplicated.
A closed channel read will return immediately with the zero value and flag indicating that 
it is closed.

```
func main() {
	ch := make(chan interface{}, 1)
	ch <- "hello"
	val, ok := <- ch
	fmt.Printf("%v, %v\n", val, ok) // prints hello, true
	close(ch)
	val, ok = <- ch
	fmt.Printf("%v, %v\n", val, ok) // prints <nil>, false
}
```

On the writer side, things can be more complicated. If you only have a single writer, 
it can be responsible for closing the channel. This notifies any blocker readers that
the channel is closed. However, if there are multiple writers, this won't work. Writing
to a closed channel will cause a panic. Closing an already closed channel will also 
cause a panic. So, what do we do?

The main thing is to realize that we don't have to close the channel. We only have to
make sure the readers and writers are safely notified that they should stop trying to
use the channel. For this, we can use a second channel.

```
package main

import (
	"github.com/openziti/foundation/util/concurrenz"
	"github.com/pkg/errors"
)

type Queue struct {
	ch          chan int
	closeNotify chan struct{}
	closed      concurrenz.AtomicBoolean
}

func (self *Queue) Push(val int) error {
	select {
	case self.ch <- val:
		return nil
	case <-self.closeNotify:
		return errors.New("queue closed")
	}
}

func (self *Queue) Pop() (int, error) {
	select {
	case val := <-self.ch:
		return val, nil
	case <-self.closeNotify:
		return 0, errors.New("queue closed")
	}
}

func (self *Queue) Close() {
	if self.closed.CompareAndSwap(false, true) {
		close(self.closeNotify)
	}
}
```

If there are several entities which all need to shutdown together, they can even
share a `closeNotify` channel.

A variation on this would let readers drain the channel once it's closed. Because 
select case evaluation is random, we may not read a val from the channel once
the close notify channel is closed. We can ensure that we return a value if it's 
available by modifying `Pop()` as follows:

```
func (self *Queue) Pop() (int, error) {
	select {
	case val := <-self.ch:
		return val, nil
	case <-self.closeNotify:
		select {
		case val := <-self.ch:
			return val, nil
		default:
			return 0, errors.New("queue closed")
		}
	}
}
```

Places used:
* https://github.com/openziti/channel/blob/main/impl.go (see rxer, txer)

## Other Channel Uses
Let's look at how we can use channels in a few other ways.

### Semaphores and Pools
Because channels have a sized buffer and have well defined blocking behavior, 
creating a semaphore implementation is very straightforward. We can create a
channel with a buffer of the size we want our semaphore to have. We can then
read and write from the channel to acquire and release the semaphore. 

```
package concurrenz

import "time"

type Semaphore interface {
	Acquire()
	AcquireWithTimeout(t time.Duration) bool
	TryAcquire() bool
	Release() bool
}

func NewSemaphore(size int) Semaphore {
	result := &semaphoreImpl{
		c: make(chan struct{}, size),
	}
	for result.Release() {
	}
	return result
}

type semaphoreImpl struct {
	c chan struct{}
}

func (self *semaphoreImpl) Acquire() {
	<-self.c
}

func (self *semaphoreImpl) AcquireWithTimeout(t time.Duration) bool {
	select {
	case <-self.c:
		return true
	case <-time.After(t):
		return false
	}
}

func (self *semaphoreImpl) TryAcquire() bool {
	select {
	case <-self.c:
		return true
	default:
		return false
	}
}

func (self *semaphoreImpl) Release() bool {
	select {
	case self.c <- struct{}{}:
		return true
	default:
		return false
	}
}
```

We could use mostly the same implementation for a resource pool. Instead of
a channel of struct{}, we could have a channel of connections or buffers 
that are acquired and released.

### Signal
We can use channels as signals. In this example we have something running
periodically, but we want to be able to trigger it to run sooner. With a 
single element channel, we can notify a goroutine. By using `select` with
`default`, we can ensure that signalling code doesn't block and that the
receiving side only gets a single signal per loop.


```
package main

import (
	"fmt"
	"github.com/openziti/foundation/util/concurrenz"
	"time"
)

func NewWorker() *Worker {
	w := &Worker{
		signal:  make(chan struct{}, 1),
	}
	go w.run()
	return w
}

type Worker struct {
	signal chan struct{}
	stopped concurrenz.AtomicBoolean
}

func (self *Worker) run() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for !self.stopped.Get() {
		select {
		case <-ticker.C:
			self.work()
		case <-self.signal:
			self.work()
		}
	}
}

func (self *Worker) work() {
	if !self.stopped.Get() {
		fmt.Println("working hard")
	}
}

func (self *Worker) RunNow() {
	select {
	case self.signal <- struct{}{}:
	default:
	}
}
```

### Channel Loops and Event Handler

We often have a loop which is processing inputs from one or channel. Often we have a set of data
we want to keep local to a single goroutine, so we don't have to use any synchronization or worry
about cpu cache effects. We use channels to feed data to the goroutine and/or to trigger different
kinds of processing. A for with select loop can handle channels of different types. YOu can have
a channel per type of work, or per type of data. Sometimes it can be convenient to consolidate things 
on a single channel, using an event API.

Here's a simple example where the processor is maintaining some cached data which can be updated 
externally. Presumably the processor would be doing something with the cached data, but we've left
that out to focus on the pattern itself.

```
type Event interface {
	// events are passed the processor so they don't each have to include it
	Handle(*Processor)
}

type Processor struct {
	ch          chan Event
	closeNotify chan struct{}
	cache map[string]string
}

func (self *Processor) run() {
	for {
		select {
		case event := <-self.ch:
			event.Handle(self)
		case <-self.closeNotify:
			return
		}
	}
}

func (self *Processor) queueEvent(evt Event) {
	select {
	case self.ch <- evt:
	case <-self.closeNotify:
		return
	}
}

func (self *Processor) UpdateCache(k, v string) {
	self.queueEvent(&updateCache{key: k, value: v})
}

func (self *Processor) Invalidate(k string) {
	self.queueEvent(invalidate(k))
}

type updateCache struct {
	key string
	value string
}

func (self *updateCache) Handle(p *Processor) {
	p.cache[self.key] = self.value
}

type invalidate string

func (self invalidate) Handle(p *Processor) {
	delete(p.cache, string(self))
}
```

## Type Aliases
As we demonstrated in the previous example we can alias a type and add functions to it, usually
to satify some interface.

```
type invalidate string

func (self invalidate) Handle(p *Processor) {
        delete(p.cache, string(self))
}
```

This can be useful if we only have a single piece of data. Rather than wrapping it in a struct, 
we can just alias it and add our own funcs. 

The main downside to this approach is that you have to unalias the data inside your functions
which can lead to code that is less clear. See for example this method from an `AtomicBoolean`
implementation:

```
type AtomicBoolean int32

func (ab *AtomicBoolean) Set(val bool) {
	atomic.StoreInt32((*int32)(ab), boolToInt(val))
}

```

### Function Type Aliases

A go feature which can surprise developers is the ability to add function definitions to funcs.
The Event API in the Processor example above could be extended as follows:

```
type Event interface {
	Handle(*Processor)
}

type EventF func(*Processor)

func (self EventF) Handle(p *Processor) {
	self(p)
}
```

The `Invalidate` code could now be written as:

```
func (self *Processor) Invalidate(k string) {
	self.queueEvent(EventF(func(processor *Processor) {
		delete(processor.cache, k)
	}))
}
```

The need for an `EventF` cast could be removed by adding a helper function.

```
func (self *Processor) queueEventF(evt EventF) {
	self.queueEvent(evt)
}

func (self *Processor) UpdateCache(k, v string) {
	self.queueEventF(func(processor *Processor) {
		processor.cache[k] = v
	})
}
```

I first encountered this style in the go http library where handlers can be defined
as structs implementing `Handler` or as functions matching `HandlerFunc`. This is
most useful when you may have both heavy implementations which carry a lot of state
as well as very simple implementations which make more sense as a function.

The processor event channel could also be implemented in terms of pure functions, if
all event implementations are lightweight.

## Interfaces

A golang limitation that often trips people up is that packages cannot have circular
dependencies. There are a few ways to work around this, but the most common is to 
introduce interfaces in the more independent of the packages.

## Errors 

In some situations, go's error handling can be excessively verbose. Especially in 
cases where you're doing a series of I/O operations, your code can look something
like:


```
func WriteExample(w io.Writer) error {
	if _, err := w.Write([]byte("one")); err != nil {
		return err
	}
	if _, err := w.Write([]byte("two")); err != nil {
		return err
	}
	if _, err := w.Write([]byte("three")); err != nil {
		return err
	}
	if _, err := w.Write([]byte("four")); err != nil {
		return err
	}
	return nil
}
```

One way to clean this up is to wrap the error in the operation and only check it at 
the end.

```
type WriterErr struct {
	err error
	w io.Writer
}

func (self *WriterErr) Write(s string) {
	if self.err == nil {
		_, self.err = self.w.Write([]byte(s))
	}
}

func (self *WriterErr) Error() error {
	return self.err
}

func WriteExample2(w io.Writer) error {
	writer := &WriterErr{w: w}
	writer.Write("one")
	writer.Write("two")
	writer.Write("three")
	writer.Write("four")
	return writer.Error()
}
```

See also: 
* https://go.dev/blog/errors-are-values
* https://dave.cheney.net/2019/01/27/eliminate-error-handling-by-eliminating-errors

Note: This pattern is could be viewed as an error monad implementation

## Gotchas

### Loop Variables[^cam]

Like many other languages, it's possible to get into trouble when capturing loop variables,
both via pointer references and via closures.

The following snippet will print out `world world` since the loop variable
remains constant throughout loop iteration.

```
func main() {
	var list []*string
	for _, v := range []string {"hello", "world"} {
		list = append(list, &v)
	}
	for _, v := range list {
		fmt.Printf("%v ", *v)
	}
	fmt.Println()
}
```

Similarly, the following will output `second second`:

```
func main() {
	for _, v := range []string {"first", "second"} {
		go func() {
			time.Sleep(100 * time.Millisecond)
			fmt.Printf("%v ", v)
		}()
	}
	time.Sleep(200 *time.Millisecond)
	fmt.Println()
}
```

### Common Deadlock Causes

#### Non-reentrant Mutexes

Unlike in some other languages, the mutexes provide in the sync package are non-reentrant. So if your code
grabs a lock and ends up calling back into something which gets the same lock, the goroutine will deadlock.
Typically, if you have to call back in, you'd either need an indicator that the lock is already acquired,
or do the work in a new go-routine, depending on how independent the second access was.

#### Channel Deadlocks

If you have a goroutine processing events from a channel, if the event submits an event back onto the channel,
that can cause a deadlock, if the channel is not buffered, or if the buffer is full.

Fixes include:
* Running the next event in-line, if you can detect that you're already in the event processing context
* Ensure the channel is buffer is big enough that it will never block
* Handing the new event submission off to a new go-routine

One benefit to keeping your channel buffers at zero, is that you will detect these deadlocks very quickly.
If you have a small buffer, then the deadlock may not be caught until the system is under load.

[^cam]: Suggested by Cameron Otts
