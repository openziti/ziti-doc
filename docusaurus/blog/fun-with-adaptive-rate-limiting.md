---
title: "Fun with Adaptive Rate Limiting"
date: 2024-01-26T17:44:12Z
cuid: clruxmy03000408gr7rdb2mk3
slug: fun-with-adaptive-rate-limiting
authors: [PaulLorenz]
image: /docs/blogs/openzitiv1706152812055/f1c7ece1-5bee-41f9-864a-1cabc710bb41.png
tags: 
  - performance
  - golang
  - security
  - apis
  - openziti

---

# Background

We recently had an issue where an [OpenZiti network](http://openziti.io) was overwhelmed with client requests when a user change unintentionally caused the request rate to spike. The fundamental problem was that if a request took too long, the client gave up, but the request was still processed. The system ended up doing work that was ignored while causing new requests to wait until they also timed out. Once the requests hit a certain threshold the system didn't degrade gracefully.

I had a fun day solving the problem, and while I'm sure that nothing here is new, I thought others might be interested in where I landed and some ideas that were rejected along the way.

# Starting Point

A rate limiter seems like an obvious answer. Better to reject requests that you know you won't be able to service than to do extra work that will just be discarded.

![small robot on beach holding a stop sign](/docs/blogs/openziti/v1706157396114/16e07758-817e-4992-b12b-9fb9c41c5749.png)

The requests take a relatively consistent amount of time to process. We also know when we've taken too long, as writing the response back to the client will fail. These two characteristics will shape our implementation.

Other notes:

* The article will use windows size instead of queue size for the number of requests that are allowed to be queued.
    
* There are [rate-limiting](https://pkg.go.dev/golang.org/x/time/rate)[packages](https://github.com/didip/tollbooth) available for Go. However, these are more focused on enforcing static limits per user, rather than on minimizing wasted work and maximizing throughput across all requests.
    

# Implementations

## Static

![](/docs/blogs/openziti/v1706194973630/6f4db0d5-b664-45bf-aebf-981cdcc975cb.png)

I started with a statically sized queue, just to get an initial implementation in place and working. However, a static rate limiter doesn't work well for this use case. Crucially, if you pick a window size that's too large, the application can fail in the same way as if there were no rate limiter. Picking the correct size is very difficult. You have to account for different hardware and other tasks in the application will change how many requests can be processed, so any number you pick won't be optimal. It would be better if we could adapt to the circumstances.

## Basic Adaptability

![](/docs/blogs/openziti/v1706194987127/25e26525-808a-4093-afc5-f3e130d271ff.gif)

The first step was allowing requests to report their success or failure back to the rate limiter.

```go
type AdaptiveRateLimiter interface {
	RunRateLimited(f func() error) (RateLimitControl, error)
}

type RateLimitControl interface {
	Success()
	Timeout()
}
```

Using the API looks something like this:

```go
ctrl, err := ae.AuthRateLimiter.RunRateLimited(func() error {
	sessionId, err := ae.Managers.ApiSession.Create(changeCtx.NewMutateContext(), newApiSession, sessionCerts)
	sessionIdHolder.Store(sessionId)
	return err
})
// ... skipping error handling, creating a response object, etc
writeOk := rc.RespondWithProducer(rc.GetProducer(), envelope, http.StatusOK)
if writeOk {
	ctrl.Success()
} else {
	ctrl.Timeout()
}
```

We can react to failures by shrinking the window size. Here's a simplified implementation, which shrinks the window size by 10 on failure, down to a configurable minimum.

```go
func (self *adaptiveRateLimiter) Timeout() {
	current := self.currentWindow.Load()
	nextWindow := current - 10
	if nextWindow < self.minWindow {
		nextWindow = self.minWindow
	}
	self.currentWindow.Store(nextWindow)
    self.successCounter.Store(0) // reset the success counter
}
```

We also need to allow the window size to grow if the load shrinks or we start too conservatively. We can do this after a certain number of sequential successes, capped at a configurable maximum. A simplified version of the success handler, which bumps the window size every 10 successes, could look something like this:

```go
func (self *adaptiveRateLimiter) Success() {
	if self.successCounter.Add(1)%10 == 0 {
		if nextVal := self.currentWindow.Add(1); nextVal > self.maxWindow {
			self.currentWindow.Store(self.maxWindow)
		}
	}
}
```

I wrote a [couple of tests](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter_test.go) to evaluate how well different rate limiters worked. One test uses a synthetic workload, so I could get quick feedback on how the algorithm performed. This test was all one process, where the work done by the rate limiter was just a short sleep. The goal was to accept as much work as possible without doing any work that would be thrown away.

A second test exercises the code in the actual context it will be used. Here I ran the OpenZiti controller and then spun up a hundred goroutines all running auth requests at the same time. I also added a delay in the controller to make authentication slower, to simulate the controller under heavy load.

This first implementation worked but didn't respond smoothly to failed work. Once it got one failure, it would usually get many more, since anything that had been queued for too long would fail. This would cause the window size to drop to the minimum very quickly. It would then slowly recover until it hit the threshold again, at which point the cycle would repeat.

## Smarter Adaptability

To try and improve this, I made a few changes. First, new requests were tagged with their initial position in the queue. If a request was added to position 100 in the queue, and then the request timed out, that tells us that a window size of 100 is currently too big. We can then shrink the window size to something slightly smaller than 100. If a request comes to the head of the queue with a position bigger than the window size it can also be discarded immediately since it's likely that it has already timed out.

The [implementation](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter.go#L198) is included in [OpenZiti v0.32.0](https://github.com/openziti/ziti/releases/tag/v0.32.0).

The [success callback](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter.go#L254) didn't need to change.

The [failure callback](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter.go#L269) now takes the initial queue position into account:

```go
func (self *adaptiveRateLimiter) failure(queuePosition int32) {
	// min window size check and locking stripped for brevity
	current := self.currentWindow.Load()
	nextWindow := queuePosition - 10
	if nextWindow < current {
		if nextWindow < self.minWindow {
			nextWindow = self.minWindow
		}
		self.currentWindow.Store(nextWindow)
	}
}
```

Finally, when [work is dequeued](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter.go#L329), the starting queue position is now checked again, in case the window size has shrunk:

```go
select {
case work := <-self.queue:
	// if we're likely to discard the work because things have been timing out,
	// skip it, and return an error instead
	if work.queuePosition > self.currentWindow.Load()+10 {
		work.result <- apierror.NewTooManyUpdatesError()
		close(work.result)
		continue
	}
```

This algorithm works well. In both tests, it was able to withstand a flood of requests. The vast majority were rejected, but the system successfully processed as many as it could handle and wasted work was minimal.

For example, here are some metrics from the synthetic test:

```plaintext
queueFulls: 422820875
timedOut: 147
completed: 4481
windowSize: 207
```

Under heavy load, only about 1 in 30 processed requests ended up timing out and the window size was relatively stable, bouncing between 190 and 220.

In the (closer to) real-world test, the application now gracefully rejected requests that were likely to timeout. Since clients retry, this ended up allowing the clients to eventually succeed.

### Future Possibilities

One possibility I considered but haven't tried yet is to service the newest requests first. Since the newest requests are the least likely to time out, it seems reasonable to try prioritizing them. You wouldn't need a window size, you could just use a reasonably large fixed-size stack. If a request timed out, then anything older than that in the stack could be discarded. If the stack size was hit, the oldest entries in the stack would be discarded to make room for newer entries.

Because I already had an implementation I was happy with, I didn't end up trying this out. If anyone has tried this, I'd be curious to hear how it worked out.

# OpenZiti Specific Notes

This rate limiter was added specifically for authentication requests. OpenZiti already had a different rate limiter for model updates ([source code](https://github.com/openziti/ziti/blob/v0.32.0/controller/command/rate_limiter.go#L115), if you're curious). Because the highest frequency updates are also idempotent, a statically sized rate limiter is fine. If the request times out and retries, the work is already done and we can return a success code.

In the longer term, authentication is moving to a JWT-based model. Since JWTs are independently verifiable, we won't need to store anything in the data store. This will remove the data store as a bottleneck and will make a request flood less catastrophic. Having a rate limiter will still be desirable, as it will provide a better experience to clients.

# Feedback

If anyone has feedback, I'm curious to hear it. Do you have a favorite rate-limiting strategy or library? Do you only think of rate limiting in a per-user context or also in a global application context? How has your rate-limiting approach changed as your application scaled up?

Thanks!

## **About OpenZiti**

[OpenZiti](http://github.com/openziti/ziti) is an open-source platform for providing secure and reliable access to network applications. It does this using strong, certificate-based identities, end-to-end encryption, mesh networking, policy-based access control, and app-embedded SDKs. If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It helps to support the project! And if you haven't seen it yet, check out [**https://zrok.io**](https://github.com/openziti/ziti/). It's a free sharing platform built on OpenZiti! It uses the OpenZiti Go SDK since it's a ziti-native application. It's also [**all open source too!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X**](https://twitter.com/openziti)**<s>Twitter</s>**, **Reddit**, or over at our [**Discourse**](https://openziti.discourse.group/). Or you can check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.

![](/docs/blogs/openziti/v1706218321488/06727c10-f73d-4425-9bd9-32561df17a02.png)
