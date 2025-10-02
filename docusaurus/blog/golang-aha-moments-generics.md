---
title: "Golang Aha! Moments: Generics"
date: 2022-10-06T17:46:21Z
cuid: cl8xcodj6000c09mi9gbne8el
slug: golang-aha-moments-generics
authors: [PaulLorenz]
image: "@site/blogs/openziti/v1663771708776/OXjhFrMmZ.jpg"
imageDark: "@site/blogs/openziti/v1663771708776/OXjhFrMmZ.jpg"
tags: 
  - golang
  - developer
  - generics
  - openziti
  - golang-aha
---

## Introduction
I work with Golang every day as a developer on the [OpenZiti project](http://openziti.io). In learning Go, 
I've hit various stumbling blocks, settled on some best practices and hopefully gotten better at writing Go code. 
This series exists to share some of the 'Aha!' moments I've had overcoming obstacles and finding solutions that 
sparked joy.

<!-- truncate -->

This [series](./tags/golang-aha) is targeted both at new team members and for anyone in the Go community who might be interested. I'm very happy to hear from others about their own 'aha'
moments and also how the solutions presented strike your sensibilities. Suggested improvements, corrections and constructive criticism are welcome.    

This second installment will cover various topics related to Go generics.

## Generics Overview
Generics were introduced into the Go language in version 1.18 after years of debate and discussion. 

This article assumes you are already familiar with generics from other languages and is not focused on the basics of using generics. Other than a brief overview, it it is focused on shortcomings, workarounds and considerations more specific to Go. For some links to more introductory works, please see the [further reading](./golang-aha-moments-generics#further-readingviewing) section at the end.

The initial release of Go generics seems focused on two things.

* Reducing copy/paste code
* Better type safety and removing casts for container types

If you're already familiar with these, feel free to skip ahead to the [learnings section](./golang-aha-moments-generics.md#generics-learnings).

### Copy/Paste Reduction
For an example of copy/paste reduction, take the classic `math.Min` function. The standard library (as of Go 1.19) only has `math.Min(x, y float64) float64`. If you want to find the minimum of any other types you either need to do some casting or write your own. 
This is admittedly trivial code to write, but there are likely many implementations scattered across many code bases at this point. With generics you can write the following code

```golang
import "golang.org/x/exp/constraints"

func Min[T constraints.Ordered](x, y T) T {
	if x < y {
		return x
	}
	return y
}
``` 

While this code isn't in the standard library yet (and neither is the useful constraints package) it likely will be in a future release. At a minimum, developers now only need to write a single `Min` function now, instead of writing one each time a new type needs to compared.

### Container Types
Before generics if you wanted a custom container, such as a b-tree implementation, copy-on-write data structures or some concurrency friendly map, it would generally be implemented in terms of `interface{}`, requiring values to be cast when extracted. An API that looked like:

```golang
type MyMap interface {
	Put(key, value interface{})
	Get(key interface{}) (interface{}, bool)
	Delete(key interface{}) bool
	Each(func (key, value interface{}))
}
```
can now instead look like:
```golang
type MyGenericMap[K comparable, V any] interface {
	Put(key K, value V)
	Get(key K) (V, bool)
	Delete(key K) bool
	Each(func (key K, value V))
}
```

OpenZiti has some data structures using generics [in the foundation library](https://github.com/openziti/foundation/blob/main/concurrenz/), including:

* CopyOnWriteMap - https://github.com/openziti/foundation/blob/v2.0.4/concurrenz/copy_on_write_map.go
* CopyOnWriteSlice - https://github.com/openziti/foundation/blob/v2.0.4/concurrenz/copy_on_write_slice.go

Over time I expect more of these types to be in the standard library. 

## Generics Learnings
### No Generic Methods
As of Go 1.19, generic functions are supported, but not generic methods (funcs defined on a type).

So for a Tree type, with the given partial implementation:

```golang
type node[E any] struct {
	value E
	children []*node[E]
}

func (self *node[E]) Add(elem E) {
	self.children = append(self.children, &node[E]{
		value: elem,
	})
}
```
If you wanted to define a `Map` method to map a Tree of values from one type to another, you couldn't define a generic method with the following signature:
```golang
// not allowed
func (self *node[E]) Map[T any](f func(E) T) *node[T] { ... }
```
The workaround is to convert the method into a func. For example, the above method could be rewritten as func:

```golang
// legal version
func Map[E any, T any](self *node[E], f func(E) T) *node[T] { ... }
```

If you had a tree and wanted map it, you'd have to write:

```golang
var tree *node[string]
var result *node[int] := Map(tree, func(s string) { return len(s) })

// instead of 
var result *node[int] := tree.Map(func(s string) { return len(s) })
``` 

While not ideal, it means that this functionality is within reach, even if the syntax is not what I would have preferred.

### New Instances of Generic Types
A common need is to be able to return a valid instance of a generic type. In the simplest case you might just need to return some default value to satisfy the method contract. Let's start with the generic Tree implementation we were using above.

```golang
type node[E any] struct {
	value E
	children []*node[E]
}
```

Let's add a method to find the first value in the tree matching a given predicate. The basic implementation is straightforward.

```golang
func (self *node[E]) GetFirstMatch(f func(E) bool) (E, bool) {
	if f(self.value) {
		return self.value, true
	}

	for _, child := range self.children {
		if val, found := child.GetFirstMatch(f); found {
			return val, found
		}
	}
    // what to return here? 
}
```
What do we return at the end, if nothing is found? We can't return nil, since E maybe a primitive or non-pointer struct. Fortunately we can just declare a `var` of type `E` and it will be assigned the default value for that type. 

```golang
func (self *node[E]) GetFirstMatch(f func(E) bool) (E, bool) {
	if f(self.value) {
		return self.value, true
	}

	for _, child := range self.children {
		if val, found := child.GetFirstMatch(f); found {
			return val, found
		}
	}
	var defaultValue E
	return defaultValue, false
}
```
There are also some cases where we want to create new instances of structs. This gets a little complicated. Let's use a type factory as an example. This example is not necessarily realistic, but it is concise.

```golang
type Example interface {
	Init(config map[string]interface{})
}

type ExampleFactory[T Example] struct {
	config map[string]interface{}
}

func (self *ExampleFactory[T]) Get() T {
	result := new(T)
	result.Init(self.config)
	return result
}
```
When we compile this, we see:
```
./scratch_2.go:14:9: result.Init undefined (type *T is pointer to type parameter, not type parameter)
./scratch_2.go:15:9: cannot use result (variable of type *T) as type T in return statement
```

In order to resolve this we need two type parameters. One for the underlying type and one for the pointer type. 

 ```golang
type Example[T any] interface {
	*T // indicates that Example must be a pointer type
	Init(config map[string]interface{})
}

type ExampleFactory[T any, P Example[T]] struct {
	config map[string]interface{}
}

func (self *ExampleFactory[T,P]) Get() P {
	var result P = new(T) // result := new(T) won't work
	result.Init(self.config)
	return result
}
```

The `Example` interface now has a type parameter. That type parameter is used to indicate that the interface must be implemented by a pointer type. We also need to include both types on the factory. Otherwise, when we call `new`, we don't have the correct type to call it with. 

Finally, `result := new(T)` doesn't work due to apparent limitations in the type inferencing, the explicit type must be provided.

### Case Study: Command Decoding
To pull some of these threads together, I thought it would be useful to look at a place where we introduced generics, in an attempt to reduce boilerplate. 

Our software has two main server side components: controllers and routers. While you can run any number of routers to form a network mesh, up till now you've only been able to run a single controller. We're working on allowing the controller to be run in a cluster for better availability and performance. Part of that work has been moving most of our model into Raft (using the excellent [Raft library](https://github.com/hashicorp/raft/) from Hashicorp). We had to move the create/update/delete logic into commands, which get applied as entries to the Raft log. We need to be able to marshal/unmarshal these commands to and from binary, both so we can ship them to the leader and so the Raft library can propagate them.

**TL;DR**: We need to be able to decode binary encoded commands. Can we reduce the boilerplate for doing that?

We're going to take a look at a simplified version of the code. We're using protobufs for the binary format.

#### Supporting Types Reference
Here are some of the primary interfaces, which you can reference when looking at the decoder implementations:

  * `TypedMessage` - message interface which is just a protobuf message which knows its command type
  * `Command` - types we're marshalling/unmarshalling
  * `DeleteEntityCommand` - example command for deleting entities
  * `Decoder` -  func for decoding a binary messages back into a Command
  * `DecoderRegistry` - place to lookup the Decoder for a give message  

This implementation has some interfaces for types messages, which extend the protobuf message

```golang
// TypedMessage instances are protobuf messages which know their command type
type TypedMessage interface {
	proto.Message
	GetCommandType() int32
}
```

Next we've got the Command interface and the delete entity command, which covers all model types. 

```golang
type Command interface {
	Apply() error
	Encode() ([]byte, error)
}

type DeleteEntityCommand struct {
	Id         string
	EntityType string
}

func (self *DeleteEntityCommand) Apply() error {
	// implemention elided for brevity 
}

func (self *DeleteEntityCommand) Encode() ([]byte, error) {
    // EncodeProtobuf marshalls the msg to bytes and prefixes the command type
	return cmd_pb.EncodeProtobuf(&cmd_pb.DeleteEntityCommand{
		EntityId:   self.Id,
		EntityType: self.EntityType,
	})
}

func (self *DeleteEntityCommand) Decode(msg *cmd_pb.DeleteEntityCommand) error {
	self.Id = msg.EntityId
	self.EntityType = msg.EntityType
	return nil
}
```

So encoding is straightforward, we can just create the appropriate protobuf type and serialize them. Decoding is a little more complicated because we're starting with the raw bytes and need a way to rebuild our types. We're going to need a `Registry` of things that can decode our various commands for us. To  keep things simple, let's just use `funcs`.

```golang
type Decoder func(data []byte) (Command, error)

type DecoderRegistry interface {
	AddDecoder(commandType int32, decoder Decoder)
}
```

#### Decoder: No Generics

Now we can create a decoder for our `DeleteEntityCommand` and register it.

```golang
func decodeDeleteEntityCommand(data []byte) (Command, error) {
    // Unmarshal to a protobuf message type
	msg := &cmd_pb.DeleteEntityCommand{}
	if err := proto.Unmarshal(data, msg); err != nil {
		return nil, err
	}

    // Populate the command using the protobuf message
	cmd := &DeleteEntityCommand{}
	if err := cmd.Decode(msg); err != nil {
		return nil, err
	}

	return cmd, nil
}

func registerDecodeDeleteCommand(registry DecoderRegistry) {
	registry.AddDecoder(int32(cmd_pb.CommandType_DeleteEntityType), decodeDeleteEntityCommand)
}
```
However, there's not much special going on here. This function will be essentially the same for every command. It needs to create an instance of the protobuf command, Unmarshal it, and then pass that off to a new instance of the model Command.

#### Decoder: Generics + Reflection

Here's a first pass at using generics to take care of this boilerplate.

```golang
func RegisterCommand[M TypedMessage, C decodableCommand[M]](registry DecoderRegistry, cmdType C, msgType M) {
	decoder := func(data []byte) (Command, error) {
		msg := proto.MessageV1(proto.MessageV2(msgType).ProtoReflect().New()).(M)
		if err := proto.Unmarshal(data, msg); err != nil {
			return nil, err
		}
		cmd := reflect.New(reflect.TypeOf(cmdType).Elem()).Interface().(C)
		if err := cmd.Decode(msg); err != nil {
			return nil, err
		}
		return cmd, nil
	}
	registry.AddDecoder(msgType.GetCommandType(), decoder)
}

func registerDecodeDeleteCommand(registry DecoderRegistry) {
	RegisterCommand(registry, &DeleteEntityCommand{}, &cmd_pb.DeleteEntityCommand{})
}
```

This works for removing the boilerplate. We have a single line where we register the decoder, with the two types it needs to know about.

Unfortunately, the implementation is ugly and employs both some sketchy protobuf library reflection and regular reflection. This is both hard to read and not terribly efficient.

#### Decoder: Pure Generics

We can do better using what we learned about instantiating generic types above.

```golang
type commandMsg[T any] interface {
	TypedMessage
	*T
}

type decodableCommand[T any, M any] interface {
	Command
	Decode(msg M) error
	*T
}

func RegisterCommand[MT any, CT any, M commandMsg[MT], C decodableCommand[CT, M]](registry DecoderRegistry, _ C, msg M) {
	decoder := func(data []byte) (Command, error) {
		var msg M = new(MT)
		if err := proto.Unmarshal(data, msg); err != nil {
			return nil, err
		}

		cmd := C(new(CT))
		if err := cmd.Decode(msg); err != nil {
			return nil, err
		}
		return cmd, nil
	}

	registry.AddDecoder(msg.GetCommandType(), decoder)
}

func registerDecodeDeleteCommand(registry DecoderRegistry) {
	RegisterCommand(registry, &DeleteEntityCommand{}, &cmd_pb.DeleteEntityCommand{})
}
```

##### Performance
This is better from an efficiency perspective, though admittedly not by much. The reflection based code results:

```
BenchmarkRegisterCommand-16         1013774          1259 ns/op
BenchmarkRegisterCommand-16         1012059          1267 ns/op
```

vs the generics based code:

```
BenchmarkRegisterCommand-16         1165557          1144 ns/op
BenchmarkRegisterCommand-16         1143402          1134 ns/op
``` 

However, the code is less fragile, as it's not relying on protobuf tricks, and is likely to get faster over time as generics support improves. 

##### Complexity
It is still hard code to read. However, that ugliness is balanced by a relatively clean API and reduced code externally. Personally I'll trade some encapsulated ugliness for reduced code and complexity elsewhere. This is an area where reasonable people can disagree, though.

##### Generic parameters vs args
This method could also be written with a different type signature:

```golang
func RegisterCommand[MT any, CT any, M commandMsg[MT], C decodableCommand[CT, M]](registry DecoderRegistry) { ... }

func registerDecodeDeleteCommand(registry DecoderRegistry) {
	RegisterCommand[cmd_pb.DeleteEntityCommand, DeleteEntityCommand](registry)
}
```
So we've replaced the arguments, which weren't strictly necessary and are explicitly providing the generic types instead. This is another matter of taste. As someone calling the library, I found it easier to provide function parameters than generic types, since it was easier to figure out what was required. Others might reach different conclusions.

To look at the actual implementation in OpenZiti, here are some starting points:
  * https://github.com/openziti/fabric/tree/v0.21.0/controller/command
  * https://github.com/openziti/fabric/blob/v0.21.0/controller/network/command.go

### Case Study: Entity Managers
There are also places where the the complexity tradeoff goes the other way. Let's look at an entity manager type. We've got an interface for Entities which know how to load themselves from a data store. Our model is persisted in [bbolt](https://github.com/etcd-io/bbolt), but the pattern should be broadly applicable. 

We want our base entity manager type to be able to load entities. For that, it must be able to create new instances of the entity type.

```golang
type Entity interface {
	GetId() string
	Load(store DataStore, entityData *Bucket)
}

type baseEntityManager[E Entity] struct {
	store DataStore
}

func (mgr *baseEntityManager[E]) Load(id string) (E, error) {
	var entity E // need to get new instance of E somehow
	// load entity, if it exists, otherwise return an error
	return entity, nil
}
```

If our base manager type can create new instances of the Entity type, it can load them in a generic fashion. We could use the same pattern from above to allow new instances of the entity type to be created using generics. That would look something like:

```golang
type EntityP[T any] interface {
	Entity
	*T
}

type baseEntityManager[E any, PE EntityP[E]] struct {
	store DataStore
}

func (mgr *baseEntityManager[E, PE]) Load(id string) (PE, error) {
	var entity PE = new(E) // init using generics
	// load entity, if it exists, otherwise return an error
	return entity, nil
}
```

So this works,but it also requires a more complex generics parameters and those more complex parameters have to be on every method we define on the type. So by making the one method slightly simpler, we have incurred a complexity penalty in many places. This will also spread to anywhere were the type is used. 

Given this we decided to go for a simpler solution: providing a `func` which can create new entity instances.

```golang
type baseEntityManager[E Entity] struct {
	store DataStore
	newEntity func() E
}

func (mgr *baseEntityManager[E]) Load(id string) (E, error) {
	var entity E = mgr.newEntity() // init using a constructor function
	// load entity, if it exists, otherwise return an error
	return entity, nil
}
```

While this requires us to provide logic at construction time, it keeps the rest of the code cleaner.

## Conclusion
While not perfect, generics in Go have let us remove a lot of boilerplate from the OpenZiti project. We've also found and fixed some bugs when we switched to type safe collections. 

We're generally still trying to be somewhat conservative with where we use generics. When we add it, as with the examples above, we want to be sure that we're getting good value for the extra complexity.    

It will be interesting to see where generics make their way into the standard libraries and what best practices emerge around Go generics. 

If you've got any feedback, maybe better ways to accomplish the things outlined above, let me know!

## Further Reading/Viewing

* https://go.dev/blog/intro-generics
* https://go.dev/doc/tutorial/generics
* https://gobyexample.com/generics

Here's a video some of my coworkers did around the time of the initial generics release on our weekly video stream:

%[https://www.youtube.com/watch?v=4JFA31O2UaE]
 
