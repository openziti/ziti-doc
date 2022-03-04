# Golang Aha! Moments

## Introduction
This attempts to share some of the insights we've had into writing idiomatic Go.

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

###
event pattern

## Interfaces
Using interfaces to work around package cycles

## Error Monad
Encapsulating error in the operation, to reduce verbose error checking

## Gotchas
Loop variables in closures and pointers
