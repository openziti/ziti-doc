---
title: "Golang Aha! Moments: OOP"
date: 2024-11-01T14:05:06Z
cuid: cm2yt3p2r000109kzfpv88qvp
slug: golang-aha-moments-oop
authors: [PaulLorenz]
image: "@site/blogs/openziti/v1730383460910/9b2d0062-8b76-47c6-b68d-24810fca9f8b.webp"
tags: 
  - golang
  - java
  - object-oriented-programming
  - golang-aha
---

Moving to Go as my primary development language was a surprisingly easy transition. Coming from a language with strong OOP roots, like Java, I quickly found many analogs for the OOP constructs I was used to, but also had to adjust my thinking.

This article walks through some of Go’s object oriented features and also discusses how some patterns common in other languages can be written in a way that’s closer to idiomatic Go. It also covers some features of Go that surprised and (in some cases) delighted me.

<!-- truncate -->

# Is Go Object Oriented?

Go allows you to group data into structs, and to associate logic to those structs.

```go
type Beans struct {
    Count int
}

func (beans *Beans) Spill(n int) {
    beans.Count = beans.Count - n
    fmt.Printf("spilled %d beans\n", n)
}
```

Since Go supports these simple features, it meets certain bare-minimum standard for object oriented coding.

However, as we’ll cover below, many features like inheritance, method overriding, and abstract types work differently or not at all.

### Inheritance vs Composition

Even in languages with a strong object oriented bias, people often give the advice to favor composition over inheritance. Large complicated type hierarchies can lead to fragile designs and unexpected behavior.

Go is strongly biased towards composition. This, in my experience, leads to cleaner, simpler designs, that are easier to refactor and have less surprising behavior.

**Note:** Most of the patterns explored below aren’t exclusive to Go. Go just encourages them more than other languages may.

### Fun with functions: Nil Receivers

One difference from languages like Java, is that a nil receiver is allowed and can be handled in Go code. This is the equivalent of being able to call a method on a `null` object in Java without a `NullPointerException` and have the method check if `this` is null.

```go
type Beans struct {
    Count int
}

func (beans *Beans) Spill(n int) {
    if beans == nil {
        fmt.Printf("you've got no beans to spill!\n")
     } else {    
        beans.Count = beans.Count - n
        fmt.Printf("spilled %d beans\n", n)
    }
}
```

# What do we want to do?

Rather than just look at language features, we’re going to look at what we’re trying to accomplish. Then we can see how to achieve our goals in Go, and how that might be different than a pure object-oriented approach.

## Handle different types with a common set of methods

For polymorphic types, Go uses interfaces.

```go
type Spillable interface {
    Spill(amount int)
}

type Beans struct {
    Count int
}

func (beans *Beans) Spill(n int) {
    beans.Count = beans.Count - n
    fmt.Printf("spilled %d beans\n", n)
}

type Tea struct {
    Volume int
}

func (t *Tea) Spill(n int) {
    t.Volume = t.Volume - n
    fmt.Printf("spilled %d ml of tea\n", n)
}
```

You may have noticed that the types don’t have to declare that they are `Spillable`.

### Duck(-ish) Typing

Unlike many other languages, Go types do not have to explicitly state which interfaces they implement. If the type has the correct methods, it can be used as that interface type.

I’m not sure if it’s accurate to call this duck typing, since you still need to define interfaces. But from where I’m standing, it looks a lot like duck typing and sounds like duck typing, so I’m going to call it duck typing.

This focuses the attention on where the interface is used, not where it’s implemented. In cases where a type is used in multiple contexts, Go pushes you towards multiple interfaces, one for each context. In other languages, I’ve seen types end up with one massive interface, covering all the possible contexts where it might be needed.

Consider an HR application. It might have various entities

```go
package employees

type Employee struct {
    // has name, email, address, salary, etc
}
```

```go
package vendors

type Vendor struct {
   // has company name, email, address
}
```

You might have a couple of modules, one for sending out email notifications and another for payroll.

```go
package emailer

type Contact interface {
   Email() string
   Name() string
}

func SendEmail(contact Contact, subj, body string) error { ... }
```

```go
package payroll

type Payee interface {
    Name() string
    HomeAddress() string
    Salary() float32
}

func SendPaychecks(payee Payee) error { ... }
```

Note that the payroll and email packages don’t know anything about the employee and vendor packages.

### Package Coherency

Go encourages keeping interfaces in the package where they are consumed. Let’s try adding an `Email` method to `Employee`.

```go
func (emp* Employee) Email(string subj, string body) error {
    return email.Email(emp.EmailAddress, subj, body)
}
```

If the `Contact` interface was defined in the `employee` package, we’d end up with a circular package dependency error. If the `emailer` package didn’t have a `Contact` interface, and was able to take `Employee` instances directly, that would also cause a circular package dependency error.

I found circular package dependency errors to be very frustrating when I first started with Go. Now however, having gotten more comfortable with Go style interfaces, I’ve realized the following:

1. It’s OK to have smaller, highly specific interfaces per package. There may be some overlap, but each package will end up with exactly what’s needed. This makes the use clearer for developers using the package.
    
2. Having the interfaces in the package will also decouple the package from other packages, eliminating circular dependency issues.
    

I’m still occasionally annoyed by circular dependency errors, but overall feel that the limitation promotes package decoupling and coherency.

### Requiring Type Interface Conformance

In most cases, if your type doesn’t match up with your interface, you’ll get a compile error. In some cases, where you may be doing runtime checks before converting, you might not notice that your type no longer fits the interface.

If you wish to guarantee at compile time that a specific type implements a given interface, you can do this as follows:

```go
var _ Spillable = (*Tea)(nil)
```

### Fun with functions: Function Vs Interface

Sometimes you may have an API that only requires a single method. Something like:

```go
type MessageHandler interface {
    Handle(msg []byte) error
}

type MessageHandlers interface {
    AddHandler(msgType string, handler MessageHandler)
}
```

This could also be implemented using a function type.

```go
type MessageHandler func (msg []byte) error

type MessageHandlers interface {
    AddHandler(msgType string, handler MessageHandler)
}
```

Which to use? For some library consumers a function may be more convenient. For others, an interface to implement would be better. Fortunately Go lets you handle both. In Go a function type can have methods defined on it.

This broke my brain slightly when I first encountered it, but it works well to allow both kinds of API.

```go
type MessageHandler interface {
    Handle(msg []byte) error
}

type MessageHandlerF func (msg []byte) error

func (f MessageHandlerF) Handle(msg []byte) error {
    f(msg)
}

// example use
handlers.AddHandler(MessageHandlerF(func (msg []byte) error {
    return nil
}))
```

### Extending Interfaces

Go interfaces can extend other interfaces. The classic examples are the types in the `io` package.

```go
type Closer interface {
    Close() error
}

type Reader interface {
    Read(b []byte) (n, error)
}

type ReadCloser() {
   Closer
   Reader
}
```

Older versions of Go used to complain if you extended multiple interfaces that had overlapping method signatures. Recent versions of Go no longer have this limitation, as long as method signatures with the same name match exactly.

### Anonymous Interfaces

There may be times when you want to invoke a method on a variable, but the method isn’t on the interface you’ve got. You can use an anonymous interface to check if the method exists, and if it does, invoke it.

I’m not sure there’s ever a strong reason to use an anonymous interface over declaring a named interface. I’ve used this feature when an interface was only used in a single method.

In this example we’re looking for a non-standard close method.

```go
func CloseIt(v any) error {
    if closeable, ok := v.(interface{ CloseMe() error }); ok {
        return closeable.CloseMe()
    }
    return nil
}
```

## We Want to Share Functionality Across Types

In object-oriented languages, extending a type (or sometimes multiple types) to create a new type is very common. Go does not allow structs to extend other structs in exactly the same way as most object oriented languages.

What it does offer is type composition that can look something like inheritance. We’ll look at how it works, and the potential pitfalls from this approach.

Go allows embedding both structs and interfaces.

```go
type Knocker interface {
    Knock()
}

type Door struct {
    lock sync.Mutex
    knocker Knocker
}
```

The Door type has a lock and knocker. As they are, they are just struct members. Since they are private, they won’t be accessible outside the package. If you try to `Lock` the door or `Knock` at the door, the compiler will complain.

A door isn’t a lock or a knocker, it has a lock and and a knocker. However, it still makes sense to be able to Lock or Knock the door itself. We can do that as follows.

```go
 type Knocker interface {
    Knock()
}

type Door struct {
    sync.Mutex
    Knocker
}
```

When we embed types in our struct this way, the methods and fields of the embedded types become accessible at the top-level of the struct. The embedded types can still be referenced individually using the type name.

```go
door := &Door{
    Knocker : &BrassKnocker{},
}  

door.Mutex.Lock()
door.Unlock()
door.Knocker.Knock()
door.Knock()
```

Note that we could also embed a pointer type.

```go
type Door struct {
    *sync.Mutex
    Knocker
}
```

### Method Overriding vs Method Shadowing

Methods from embedded types can’t be overridden, in an OO sense, but they can be shadowed. Here’s an example to highlight the difference.

```go
type A struct {}

func (a *A) String() string {
    return a.Name() 
}

func (a *A) Name() string {
   return "A"
}

type B struct {
    A
}

func (b *B) Name() string {
    return b.A.Name() + " or B"
}

func main () {
    a := &A{}
    b := &B{}
    fmt.Println(a.Name())    // output: "A"
    fmt.Println(a.String())  // output: "A"
    fmt.Println(b.Name())    // output: "A or B"
    fmt.Println(b.String())  // output: "A"      <-- Maybe unexpected
}
```

Because `A` doesn’t know that it’s embedded by `B`, it won’t call `B`'s versions of methods that have been overridden. As long as you use type embedding with a composition mindset instead of an inheritance mindset, you should be OK.

### I Want Abstract Types!

Abstract types can be a very useful way of providing some base functionality that relies on methods to be supplied by a sub-type. When I first started using Go, I was generally happy and productive with the language. Two things I missed from Java were generics and abstract data types. Generics have since come to [Go in version 1.18](https://go.dev/blog/intro-generics), and I’ve since learned patterns better suited to Go to replace abstract data types.

Here’s a java example of an abstract data type:

```java
public abstract class AbstractDataStore<T> {
    
    public abstract T LoadEntity(Row r);
    
    public List<T> ListEntities(Database db, String query) {
         Cursor c = db.ExecuteQuery(query);
         List<T> result = new ArrayList<T>(); 
         while (c.HasNext()) {
             Row row = c.Next();
             T entity = this.LoadEntity(row);
             result.Add(entity);
         }
         return result;
    }
}
```

We’ve got a data store that’s got some generic functionality to iterate over database results and build an entity list. Each concrete implementation would manage the details specific to that entity type.

### The Wrong Way

The first time I tried modeling something like this in Go, I came up with a pattern similar to abstract types, but significantly worse because the underlying abstractions weren’t there to support it.

The idea was that if you defined the full API as an interface, the abstract type could keep a reference to the concrete type, and call it as necessary.

```go
type DataStore[T any] interface {
    LoadEntity(r *Row) T
    ListEntities(db Database, query string) []T
}

type BaseStore[T any] struct {
    impl DataStore[T]
}

func (store *BaseStore[T]) ListEntities(db Database, query string) []T {
    cursor = db.ExecuteQuery(query)
    var result []T
    for cursor.HasNext() {
        row := cursor.Next()
        entity := store.impl.LoadEntity(r)
        result = append(result, entity)
    }
    return result
}
```

While this does work, it has a downside. If you treat it as an actual abstract type and try to override any of the base methods in the embedding type, they will only be shadowed. If you then ever forget to call the concrete version on the embedded `impl`, you’ll get the default version. This kind of bug can be easy to miss and hard to track down.

Subjectively, it also doesn’t feel right. It feels like we’re working against the language, rather than with it.

### A Better Way

The solution above is not that far off from something that feels more in line with Go’s ethos.

What is it we’re trying to accomplish? We’ve got a core set of functionality that needs to delegate some logic. There’s another pattern that fits this description:

#### Strategies

Instead of trying to implement abstract types, we can use strategies. Let’s look at what a strategy oriented version of the above code would look like:

```go
type EntityLoader[T any] interface {
    LoadEntity(r *Row) T
}

type Store[T any] struct {
    entityLoader EntityLoader[T]
}

func (store *Store[T]) ListEntities(db Database, query string) []T {
    cursor = db.ExecuteQuery(query)
    var result []T
    for cursor.HasNext() {
        row := cursor.Next()
        entity := store.entityLoader.LoadEntity(r)
        result = append(result, entity)
    }
    return result
}
```

It looks very similar, but the intent is different. This is a composition-oriented approach. Rather than extending a BaseStore, then overriding pieces, we compose the various strategies we might need.

This approach also lends itself to sharing functionality in a clean way. You might have three or four different strategies. Some of them might have default implementations that are rarely replaced. Some might have only a small set of implementations that are used across many instances. Some might be different for every instance.

Rather than trying to shape these as overrides in a convoluted type hierarchy, each instance can mix and match as needed.

# Conclusion

Every language has some inbuilt preferences. If you’re coming from a heavily object-oriented language, it can take time to adapt how you design your data types in Go. However, I think Go pushes you towards code that is less fragile and cleaner. If I were to write Java code again, it would be positively influenced by the habits I’ve picked up from Go.

## About OpenZiti

[OpenZiti](http://github.com/openziti/ziti) is an open-source platform for providing secure and reliable access to network applications. It does this using strong, certificate-based identities, end-to-end encryption, mesh networking, policy-based access control, and app-embedded SDKs. If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It helps to support the project! And if you haven't seen it yet, check out [**zrok.io**](https://zrok.io). It's a free sharing platform built on OpenZiti! It uses the OpenZiti Go SDK since it's a ziti-native application. It's also [**all open source too!**](https://github.com/openziti/zrok/)

Tell us how you're using OpenZiti on [**X**](https://twitter.com/openziti)**<s>Twitter</s>**, [**Reddit**](https://www.reddit.com/r/openziti/), or over at our [**Discourse**](https://openziti.discourse.group/). Or you can check out [**our content on YouTube**](https://youtube.com/openziti) if that's more your speed. Regardless of how, we'd love to hear from you.
