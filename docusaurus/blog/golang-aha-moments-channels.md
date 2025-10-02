---
title: "Golang Aha! Moments: Channels"
date: 2022-09-09T00:40:45Z
cuid: cl7tr5gdz01hqpgnv7zbl75uh
slug: golang-aha-moments-channels
authors: [PaulLorenz]
image: "@site/blogs/openziti/v1662683219596/YY8xRufSo.jpg"
tags: 
  - golang
  - developer
  - channels
  - openziti
  - golang-aha
---

## Introduction

I work with Golang every day as a developer on the [OpenZiti project](http://openziti.io). In learning Go, 
I've hit various stumbling blocks, settled on some best practices and hopefully gotten better at writing Go code. 
This series exists to share some of the 'Aha!' moments I've had overcoming obstacles and finding solutions that 
sparked joy.

<!-- truncate -->

This [series](./tags/golang-aha) is targeted both at new team members and for anyone in the Go community who might be interested. We'd be very happy to hear from others about their own 'aha' moments and also how the solutions presented strike your sensibilities. Suggested improvements, corrections and constructive criticism are welcome.

This first installment will cover various topics related to Go channels.

## Channels

Channels are a core feature of Go. As is typical of Go, the channel API is small and simple, but provides a lot of power.

See here for a quick [Go channels refresher](https://go.dev/tour/concurrency/2). Also, if you haven't read it yet, Dave Cheney's [Channel Axioms](https://dave.cheney.net/2014/03/19/channel-axioms) is worth a look.

## Channels For Signals

### Simple Broadcast

There are a few ways we can use channels to signal other goroutines. The first is if we want to broadcast a one time notification. For example, if you have a something with several associated goroutines and you want to clean them all up together, you can use a single unbuffered channel which they can monitor for closes.

As an example, you might have a UDP socket listener that's handling UDP connections. Since UDP doesn't have timeouts, you need to make sure that idle connections are eventually cleaned up. So you create an idle connection scanner. You want the goroutine for this scanner to stop when the UDP socket listener is closed, so you pass it a channel that you'll close when the socket is closed.

```golang
import (
	"time"
)

type IdleScanner struct {
	closeNotify <-chan struct{}
}

func (self *IdleScanner) run() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <- ticker.C:
			// scan for idle connections
		case <- self.closeNotify:
			return // shutting down
		}
	}
}
```

Note that the `IdleScanner` has a `<- chan`, so it can only check if the channel is closed, it cannot close the channel itself.

This pattern can be seen in several places in OpenZiti. Here's one in a UDP connection handling context:

* https://github.com/openziti/edge/blob/v0.22.89/tunnel/udp\_vconn/conn.go#L51
    

Note that this pattern does have one downside for handling shutdown behavior, namely that you can signal components to shut down, but you can't tell when all the components are finished shutting down. In many use cases this is fine, but there are places where this would be a problem.

### Wake Signal

In this example we have something running periodically, but we want to be able to trigger it to run sooner. With a single element channel, we can notify a goroutine. By using `select` with`default`, we can ensure that signalling code doesn't block and that the receiving side only gets a single signal per loop.

```golang
package main

import (
	"fmt"
	"sync/atomic"
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
	stopped atomic.Bool
}

func (self *Worker) run() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for !self.stopped.Load() {
		select {
		case <-ticker.C:
			self.work()
		case <-self.signal:
			self.work()
		}
	}
}

func (self *Worker) work() {
	if !self.stopped.Load() {
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

This is used in OpenZiti in an event processor to force quicker evaluation of events for tests. See here:

* https://github.com/openziti/edge/blob/v0.22.89/controller/persistence/eventual\_eventer.go#L404
    

## Closing Multi-writer Channels

Closing channels can be complicated. On the reader side, things are generally simple. A read on a closed channel will return immediately with the zero value and flag indicating that it is closed.

```golang
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

On the writer side, things can be more complicated. If you only have a single writer, it can be responsible for closing the channel. This notifies any blocker readers that the channel is closed. However, if there are multiple writers, this won't work. Writing to a closed channel will cause a panic. Closing an already closed channel will also cause a panic. So what to do?

The realization I eventually had was that the channel doesn't need to be closed. What we want to achieve is making sure the readers and writers are safely notified that they should stop trying to use the channel. For this, we can use a second channel, following the broadcast pattern shown above.

Here is an example of a multi-reader/multi-writer queue which can be closed, notifying writers and readers that no further reads or writes should be made.

```golang
package main

import (
	"errors"
	"sync/atomic"
)

type Queue struct {
	ch          chan int
	closeNotify chan struct{}
	closed      atomic.Bool
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
    if self.closed.Load() {
		return 0, errors.New("queue closed")
    }        
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

A variation on this would let readers drain the channel once it's closed. Because select case evaluation is random, we may not read a val from the channel once the close notify channel is closed. We can ensure that we return a value if it's available by modifying `Pop()` as follows:

```golang
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

This pattern is used in several places in OpenZiti, including in the binary message framework (somewhat confusing also called channel) and the mesh network flow control.

* https://github.com/openziti/channel/blob/v1.0.2/impl.go (see rxer, txer)
    
* https://github.com/openziti/fabric/blob/v0.19.64/router/xgress/xgress.go (littler harder to see, but can start with `closeNotify` in the xgress struct)
    

## Semaphores and Pools

Because channels have a sized buffer and well defined blocking behavior, creating a semaphore implementation is very straightforward. We can create a channel with a buffer of the size we want our semaphore to have. We can then read and write from the channel to acquire and release the semaphore.

```golang
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

We could use mostly the same implementation for a resource pool. Instead of a channel of `struct{}`, we could have a channel of connections or buffers that are acquired and released.

This semaphore implementation is here:

* https://github.com/openziti/foundation/blob/v2.0.4/concurrenz/semaphore.go
    

Golang does have a weighted semaphore implementation in the extended libraries here: https://pkg.go.dev/golang.org/x/sync/semaphore which may be preferable.

That said, there are lots of ways to implement semaphores, but I appreciate how this implementation showcases some of the power and simplicity of Go channels.

## Event Handler Loops

We often have a loop which is processing inputs from one or more channels. This is usually to keep a set of data local to a single goroutine, so we don't have to use any synchronization or worry about CPU cache effects. We use channels to feed data to the goroutine and/or to trigger different kinds of processing. A `for` with `select` loop can handle channels of different types. A first impulse might be to have a channel per type of work, or per type of data. However you can also use a single channel which takes an interface.

Here's a simple example where the processor is maintaining some cached data which can be updated externally. Presumably the processor would be doing something with the cached data, but we've left that out to focus on the pattern itself.

```golang
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

This can be seen in OpenZiti here:

* https://github.com/openziti/sdk-golang/blob/v0.16.119/ziti/edge/msg\_mux\_ch.go#L104
    

Note that over time we've used this pattern less and moved more to using explicitly concurrent data structures. For example, we generally don't use the above type any more and instead use a different implementation which uses a copy-on-write map, as the data that was being protected was rarely being written, but read often. The alternative version can be found here: https://github.com/openziti/sdk-golang/blob/v0.16.119/ziti/edge/msg\_mux.go (not yet updated for generics).

Funnily enough, after my initial post I found myself using this pattern again in some metrics processing code. I'll update this post once the code is complete.

*The Go Gopher was created by* [*Renee French*](http://reneefrench.blogspot.com/) *and is licensed under* [*Creative Commons Attribution 3.0*](https://creativecommons.org/licenses/by/3.0/) *(see https://go.dev/blog/gopher)*
