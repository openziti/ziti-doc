---
title: "My Pi Day Journey with Go 64-bit alignment"
date: 2023-03-17T13:07:52Z
cuid: clfck29eh000309lkfcoc0ekh
slug: my-pi-day-journey-with-go-64-bit-alignment
authors: [GeoffBerl]
image: /blogs/openziti/v1678975036152/5a834580-b0f3-481b-9409-61c697ed719b.png
tags:
  - golang
  - raspberry-pi
  - troubleshooting
  - openziti

---

A few days ago, we had a user bring to our attention, a failure of OpenZiti on a Raspberry Pi 4 running a 32-bit operating system. As I got started investigating the bug, I smirked a little as it just so happened to be Pi day (March 14th).

<!-- truncate -->

In any case, the error presented looked like this.

```bash
panic: unaligned 64-bit atomic operation

goroutine 118 [running]:
runtime/internal/atomic.panicUnaligned()
        runtime/internal/atomic/unaligned.go:8 +0x24
runtime/internal/atomic.Load64(0x45a8354)
        runtime/internal/atomic/atomic_arm.s:280 +0x14
```

My immediate thought was, you must be running a 64-bit binary on a 32-bit system. But, to my surprise, the user responded, assuring me they were using the 32-bit arm release.

Well, it seemed it was time to dig my raspberry pi out of the abyss of untouched, but of course, still running Raspberry Pis I had around my house. I installed a 32-bit and 64-bit OS on two different SD cards and started my journey.

### 64 Bit Raspbian

The 64-bit [expressInstall](https://docs.openziti.io/docs/learn/quickstarts/network/local-no-docker) process went swimmingly, with no issues at all. I started up the router, and zipped through some boilerplate commands I have to test out an OpenZiti network locally. No problems, I hadn't expected any since the user seeing the issue is running a 32-bit OS, but I had to be sure.

### 32 Bit Raspbian

Onto the 32-bit Raspbian, I went, again, [expressInstall](https://docs.openziti.io/docs/learn/quickstarts/network/local-no-docker) is no problem. I start up the router, annnnd there it is.

```bash
$ startRouter
[2] 1486
Express Edge Router started as process id: 1486. log located at: /home/gberl001/.ziti/quickstart/raspberrypi/raspberrypi-edge-router.log

[2]+  Exit 2                  "${ZITI_BIN_DIR}/ziti" router run "${ZITI_HOME_OS_SPECIFIC}/${ZITI_EDGE_ROUTER_RAWNAME}.yaml" > "${log_file}" 2>&1
```

I checked the router log, and sure enough `panic: unaligned 64-bit atomic operation`.

```go
panic: unaligned 64-bit atomic operation

goroutine 41 [running]:
runtime/internal/atomic.panicUnaligned()
        runtime/internal/atomic/unaligned.go:8 +0x24
runtime/internal/atomic.Load64(0x638f404)
        runtime/internal/atomic/atomic_arm.s:280 +0x14
github.com/openziti/channel/v2.(*heartbeater).Tx(0x638f3e0, 0x5e06080, {0x2eb5ecc, 0x63862d0})
        github.com/openziti/channel/v2@v2.0.27/heartbeater.go:82 +0x1b8
github.com/openziti/channel/v2.(*channelImpl).txer(0x63862d0)
        github.com/openziti/channel/v2@v2.0.27/impl.go:422 +0x984
created by github.com/openziti/channel/v2.(*channelImpl).startMultiplex
        github.com/openziti/channel/v2@v2.0.27/impl.go:287 +0x128
```

So I traced the stack to the location where it failed, and I see it's trying to load an int in an atomic operation.

```go
if unrespondedHeartbeat := atomic.LoadInt64(&self.unrespondedHeartbeat); unrespondedHeartbeat != 0 {
		m.PutUint64Header(HeartbeatResponseHeader, uint64(unrespondedHeartbeat))
		atomic.StoreInt64(&self.unrespondedHeartbeat, 0)
		select {
		case self.events <- heartbeatRespTxEvent(now):
		default:
		}
	}
```

This led me to do as every programmer does, look online for an answer, fingers crossed for a stack-overflow post haha. Of course, I saw a bunch of responders who had my initial reaction, thinking it was a 64-bit binary on a 32-bit OS they said, "switch to Raspbian 64-bit," and went on with their day. While that *is* *a* solution, it's not the right one, the right solution would be to fix the issue with the binary that is supposed to run on a 32-bit OS. But, like me, they didn't know the real cause of the problem. I removed the keywords "Raspberry" and "Pi" from my search and got much better results, leading me to [this GitHub issue](https://github.com/golang/go/issues/36606) which ultimately (after carefully reading and following a rabbit hole of links) got me to a point where I better understood what was going on.

### The Cause

It's not every day you hear about unaligned memory-related operations, and this is generally because the compiler handles these messes for you automatically. In fact, I have never experienced an issue like this and had no idea this was even a thing. Hence, my first assumption was that it was simply a 64-bit binary on a 32-bit OS. This is somewhat of a unique situation as it's specific to 64-bit atomic operations in Golang. I don't pretend to understand the Golang compiler well enough to know why this is only an issue with atomic operations or why this is even an issue at all, as generally, compilers will add padding to align data automatically, you can see much more information on that in this [Wikipedia article](https://en.wikipedia.org/wiki/Data_structure_alignment), which is surprisingly well-written and understandable. But, what I can say is, the problem lies in the fact that memory is byte addressable, and is accessed by a single word size at a time. The word size changes depending on the architecture. On arm, and other 32-bit architectures, this is 32 bits, so the processing word size will be 4 bytes. My guess as to the root of this problem lies in the nature of atomic operations. When memory addresses for data are properly aligned, it should only take one cycle to read the data, if it is misaligned, then it would take more than one cycle and, thus, likely cannot guarantee atomicity. As mentioned, I'm not entirely positive on this, that's just my interpretation, so if you have any input on this, I'd love to hear it in the comments.

### The Fix

As stated by the [Golang documentation](https://pkg.go.dev/sync/atomic#pkg-note-BUG) (link thanks to the treasure trove of information starting, in one way or another, from the original GitHub issue), it is the caller's responsibility to arrange for 64-bit alignment of 64-bit words accessed atomically on a 32-bit architecture. To do this, the 64-bit variables need to be aligned with an 8-byte word boundary. Essentially, if the address is not divisible by 8, we're going to see this issue. So, I need to find every 64-bit variable that has an atomic operation performed on it, then see if that is stored in a data structure. If the variable is stored in a data structure, I then need to ensure the alignment is at an 8-byte word boundary.

I whipped up a quick little test using `Alignof`, `Sizeof`, and `Offsetof` from the `unsafe` package in Golang as is documented [here](https://go.dev/ref/spec#Size_and_alignment_guarantees), to show the offsets of variables in a suspected struct, there is a bit of extra information as I was still not totally sure what I was looking for.

Here's the struct containing the problem variable; `unrespondedHeartbeat`.

```go
type heartbeater struct {
	ch                   Channel
	lastHeartbeatTx      int64
	heartBeatIntervalNs  int64
	callback             HeartbeatCallback
	events               chan heartbeatEvent
	unrespondedHeartbeat int64
}
```

And, here's the quick test showing Alignof, Sizeof, and Offsetof for each variable in the struct.

```go
func TestAlignment(t *testing.T) {
	hb := heartbeater{}

	fmt.Printf("Channel Alignof: %v\n", unsafe.Alignof(hb.ch))
	fmt.Printf("lastHearbeatTx Alignof: %v\n", unsafe.Alignof(hb.lastHeartbeatTx))
	fmt.Printf("heartBeatInternalNs Alignof: %v\n", unsafe.Alignof(hb.heartBeatIntervalNs))
	fmt.Printf("Callback Alignof: %v\n", unsafe.Alignof(hb.callback))
	fmt.Printf("chan heartbeatEvent Alignof: %v\n", unsafe.Alignof(hb.events))
	fmt.Printf("unrespondedHeartbeat Alignof: %v\n", unsafe.Alignof(hb.unrespondedHeartbeat))

	fmt.Printf("\n\n")
	fmt.Printf("Channel Sizeof: %v\n", unsafe.Sizeof(hb.ch))
	fmt.Printf("lastHearbeatTx Sizeof: %v\n", unsafe.Sizeof(hb.lastHeartbeatTx))
	fmt.Printf("heartBeatInternalNs Sizeof: %v\n", unsafe.Sizeof(hb.heartBeatIntervalNs))
	fmt.Printf("Callback Sizeof: %v\n", unsafe.Sizeof(hb.callback))
	fmt.Printf("chan heartbeatEvent Sizeof: %v\n", unsafe.Sizeof(hb.events))
	fmt.Printf("unrespondedHeartbeat Sizeof: %v\n", unsafe.Sizeof(hb.unrespondedHeartbeat))

	fmt.Printf("\n\n")
	fmt.Printf("Channel Offsetof: %v\n", unsafe.Offsetof(hb.ch))
	fmt.Printf("lastHearbeatTx Offsetof: %v\n", unsafe.Offsetof(hb.lastHeartbeatTx))
	fmt.Printf("heartBeatInternalNs Offsetof: %v\n", unsafe.Offsetof(hb.heartBeatIntervalNs))
	fmt.Printf("Callback Offsetof: %v\n", unsafe.Offsetof(hb.callback))
	fmt.Printf("chan heartbeatEvent Offsetof: %v\n", unsafe.Offsetof(hb.events))
	fmt.Printf("unrespondedHeartbeat Offsetof: %v\n", unsafe.Offsetof(hb.unrespondedHeartbeat))
}
```

And, here are the results (run on the Raspberry Pi of course); can you spot the issue?

```go
$ go test -v -run TestAlignment
=== RUN   TestAlignment
Channel Alignof: 4
lastHearbeatTx Alignof: 4
heartBeatInternalNs Alignof: 4
Callback Alignof: 4
chan heartbeatEvent Alignof: 4
unrespondedHeartbeat Alignof: 4


Channel Sizeof: 8
lastHearbeatTx Sizeof: 8
heartBeatInternalNs Sizeof: 8
Callback Sizeof: 8
chan heartbeatEvent Sizeof: 4
unrespondedHeartbeat Sizeof: 8


Channel Offsetof: 0
lastHearbeatTx Offsetof: 8
heartBeatInternalNs Offsetof: 16
Callback Offsetof: 24
chan heartbeatEvent Offsetof: 32
unrespondedHeartbeat Offsetof: 36
--- PASS: TestAlignment (0.00s)
PASS
ok  	github.com/openziti/channel/v2	0.014s
```

If you guessed that `unrespondedHeartbeat`'s offset is not at an 8-byte word boundary, then go congratulate yourself and buy that gadget on your Amazon wish list you've had on there for years but know you don't need. The variable needed to be at an 8-byte boundary, an offset of 36 is not an 8-byte boundary. The variable `chan`, which is a pointer, hence the 4 bytes, is the reason, and seeing that chan *was* at an 8-byte word boundary, I simply popped that guy (`unrespondedHeartbeat`) up before `chan` and that put it at an offset of 32. Here's what I got after moving it up before `chan`. Bear in mind, since I reordered the struct, I reordered the test outputs to keep my sanity.

```go
$ go test -v -run TestAlignment
=== RUN   TestAlignment
Channel Alignof: 4
lastHearbeatTx Alignof: 4
heartBeatInternalNs Alignof: 4
Callback Alignof: 4
unrespondedHeartbeat Alignof: 4
chan heartbeatEvent Alignof: 4


Channel Sizeof: 8
lastHearbeatTx Sizeof: 8
heartBeatInternalNs Sizeof: 8
Callback Sizeof: 8
unrespondedHeartbeat Sizeof: 8
chan heartbeatEvent Sizeof: 4


Channel Offsetof: 0
lastHearbeatTx Offsetof: 8
heartBeatInternalNs Offsetof: 16
Callback Offsetof: 32
unrespondedHeartbeat Offsetof: 24
chan heartbeatEvent Offsetof: 40
--- PASS: TestAlignment (0.00s)
PASS
ok  	github.com/openziti/channel/v2	0.015s
```

With `unrespondedHeartbeat` having an offset of 24, all is right with the world, well, it is for 32-bit arm devices that can now be used to run OpenZiti. An alternative is that I could have put some padding after chan to bump `unrespondedHeartbeat`'s offset to 40, which would make it an 8-byte boundary. I guess there are pros and cons to each. There is even a third option, I could have moved all of the int64 variables to the beginning of the struct since the first one will clearly start at offset 0, with each being an 8-byte variable any int64 immediately following would be guaranteed as well. But who's to say someone doesn't come in down the road and add a variable right at the beginning of the struct and throw everything off? I opted not to go into analysis paralysis and just pick one, any solution was just a one-line commit away from being broken in the future.

This [xkcd](https://xkcd.com/) sums up my pragmatic decision nicely.

![Efficiency](https://imgs.xkcd.com/comics/efficiency.png align="left")

I knew this wasn't going to be the only case, there was no way that more wouldn't appear in this project and many other projects used by OpenZiti. So, the easiest way I could come up with to solve this across the board was to, as before, find all variables which have atomic 64-bit operations performed on them, and check if they are in a data structure. To start this venture, I put together a quick little regex and grepped it across the project, to pull out all 64-bit variables having atomic operations performed on them. Unfortunately, Mac grep doesn't have Perl regex so there's a little quirk in my regex to make it "non-greedy".

```bash
grep --include=\*.go -irn ./ -e "atomic\.[^6]*64("
```

This resulted in the following, a quick copy-paste into Sublime Text and regex to extract the variable names.

![](/blogs/openziti/v1678906066090/0335faba-14a4-4457-bebd-7e9f2f80c67d.png)

There's no quick way to determine if they are in a data structure so I just used a search across the project for each variable, then jumped to the declaration of that variable. There were only nine results, and of those, only three distinct variables. I wrote a test that attempted to perform an atomic operation on any variable that I found to be in a struct, and checked if it failed. After collecting them all, and running the test, I investigated any failures and left the rest alone.

Here's what my new test looked like

```go
func Test64BitAlignment(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("One of the variables that was tested is not properly 64-bit aligned.")
		}
	}()

	hb := heartbeater{}
	chImpl := channelImpl{}

	atomic.LoadInt64(&hb.lastHeartbeatTx)
	atomic.LoadInt64(&hb.unrespondedHeartbeat)
	atomic.LoadInt64(&chImpl.lastRead)
}
```

I repeated this process for other projects and found a few more spots where we likely would have had issues down the road. I, of course, left the tests in place, which will at least make sure we don't break these existing variables "hooray for regression tests!"

### Pi Day 2023 Concludes

I never really took much significance in Pi Day in the past. It really has nothing to do with Raspberry Pi other than the creators spelled pie without the e, so it resembles the mathematical value. In any case, I just found it slightly amusing that I happened to be fixing a Raspberry Pi-related bug on a Raspberry Pi, on Pi Day.
