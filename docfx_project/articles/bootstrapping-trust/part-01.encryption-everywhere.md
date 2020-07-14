# Bootstrapping Trust

## Part 1: Encryption Everywhere

Whether you are an encryption expert or a newcomer, welcome! This series
is for you! It assumes you know nothing and takes you from soup to nuts
on how to bootstrap trust with the intent to power a Zero Trust security
model. The process and thinking described in this series is the direct
output of developing the same system for the Ziti open source project.
Ziti can be found on the GitHub project page for
(OpenZiti)[https://github.com/openziti]. The series starts with the
basics and dovetails into Ziti's Enrollment system.

The parts are as follows.

- [Part 1: Encryption Everywhere](./part-01.encryption-everywhere.md)
- [Part 2: A Primer On Public-Key Cryptography](./part-02.a-primer-on-public-key-cryptography.md)
- [Part 3: Certificates](./part-03.certificates.md)
- [Part 4: Certificate Authorities & Chains Of Trust](./part-04.certificate-authorities-and-chains-of-trust.md)
- [Part 5: Bootstrapping Trust](./part-05.bootstrapping-trust.md)


### Zero Trust

Zero Trust is a security model that requires strict identity
authentication and access verification. This entire series assumes some
familiarity with Zero Trust. If you do not have a strong background in
it, that is fine. This section should give the reader enough context to
make use of the entire series. If a deeper understanding is desired
please consider reading Zero Trust Networks: Building Secure Systems in
Untrusted Networks by Evan Gilman.

Before the Zero Trust security models, IT infrastructures were set up as
a series of security perimeters. Think of as a castle with walls and
moats. The castle would have a set number of entry points with guards.
Once passed the guards and inside the castle any visitors were trusted
and had access to the castle. In the real world, passing the guards
would be authenticating with your machine or at worst only connecting
the office network via WiFi or ethernet cable.

Zero Trust does away with the concept of having a central castle that
assumes anyone inside the castle is trusted. It assumes that the castle
has already been breached. That is to say, in the real world, we expect
attackers to already be inside the network and for it to be a hostile
environment. Any resources inside the network should be treated as
publicly available on the internet and must be defended. To accomplish
this a series of Zero Trust pillars are defined:

- Never Trust, Verify - the virtue of a connection should not grant
  access
- Authenticate Before Connect - authentication should happen before
  resources are connected to or requested
- Least Privileged Access - access should only grant connectivity to the
  minimum number of resources

Of those principles, the first principle is the main focus of this
article series. How can we set up a series of systems such that they do
not implicitly trust each other and instead verify the identity of every
connection? Trust has to start somewhere, and to get that initial trust
in place is what I call "Bootstrapping Trust." It turns out to be a
complex and interesting problem.

### Ziti & Zero Trust

In a Zero Trust model there needs to exist mechanisms to verify
identities such that trust can be granted. Zero Trust does not mean
there is no trust. Zero Trust means that trust is granted only after
verification. Even then that trust is limited to accessing the minimum
network resources necessary. To accomplish this, we need a network that
can forces all connections through the following process

1. Authenticate
2. Request Access To A Resource
3. Connect To Requested Resource

To help make Zero Trust and Bootstrapping trust a bit clearer it helps
to have a concrete system to use an example. It just so happens that the
Ziti software system makes a great example! Let us examine Ziti.

In Ziti, all of the above steps require interacting with a piece of
software called the Ziti Controller. The Ziti Controller manages the
Ziti overlay network. It manages a list of known network services, SDK
clients, routers, enrollments, policies, and much more! All of these
pieces working together create a Ziti Network. A Ziti Network is an
overlay network - meaning it creates a virtual network on top of some
other network referred to as the underlay network.

In the Ziti Network all network resources are modeled as services in the
Ziti Controller. All services on a Ziti Network should only be
accessible via the Ziti Network. Network services can be made accessible
via a Ziti Network in a variety of manners. The preferred method is by
embedding the Ziti SDK inside of applications and servers as it provides
the highest degree of Zero Trust security. However, it is also possible
to configure various overly to underlay connections to existing network
services via router termination or a special type of application with
the Ziti SDK embedded in it called a tunneler.

The controller also knows about one or more Ziti Routers that form a
mesh network that can create dynamic circuits amongst themselves.
Routers use circuits to move data across the Ziti Network. Routers also
have the ability to be configured to allow data to enter and exit the
mesh. The most common entry/exit points are Ziti SDKs acting as clients
or servers.

Network clients wishing to attach the network use the Ziti SDK to first
authenticate with the Ziti Controller. Upon successful authentication,
the controller can provide a list of services that are available to
connect to or to bind (host) for the authenticated SDK Client. The
client can then request to dial (connect) or bind (host) to a service.
If fulfilled a session is associated with the client and service. This
new session is propagated to the necessary Ziti Routers. The requesting
client is returned a list of Ziti Routers that can be connected to in
order to complete the last mile of communication between the Ziti
Overlay Network and the SDK client.

This set of steps covers pillars of the Zero Trust model! The controller
does not trust the client instead it verifies it via authentication. In
addition the client has the ability to verify the controller. The client
cannot connect to network resources or services until it authenticates.
After authentication, a client is given the least privilege access
allowed by only being told about and only being able to dial/bind
assigned services! It is a Zero Trust slam dunk!

However how did this system come into existence? In a Zero Trust model
both sides of a connection should be verifying each other. How does the
Ziti SDK client know to trust the controller? How did it authenticate?
How do the routers and controller know to trust each other? How is this
managed at scale with hundreds o Ziti Routers and thousands of Ziti SDK
clients? To get that process in place we need to bootstrap trust!

# Trust

In software systems that require network connectivity there are at least
two parties in the system. Generally there are more and in the case of a
Ziti network there may be thousands. Between these parties each time a
connection is made a trust decision is made. Should this connection be
allowed? To interrogate that connection mechanisms must be put into
place that can verify the identity of the connecting party.

One mechanism that might jump out at the reader is passwords or secrets.
In Ziti it would be possible to configure the Controller, Routers, and
SDK Clients with a secret. Software is easy to deploy with a secret! It
is also fundamentally weak as there is only one secret in the system
necessary to compromise the entire system. In Ziti this would mean
giving the secret to network clients that may or may not remain Ziti's
control let alone remain secure. In addition, shared secrets do not
individually identify each component.

Stepping up that solution secrets could generated per software
component. The controller, each router, and each SDK client could have a
unique secret. This secret would then individually identity each
component! It is a great improvement, but how does each component verify
connections? Do they challenge for the incoming connections secret and
compare it to a list? That mans that pair of systems that need to
connect to one another must have each others secrets. This will not do!
We can not be copying secrets between every machine. One machine that is
compromised would mean that multiple secrets are reveled!

This solution can be evolved and improved, but we do not have to it! It
has already been solved for us in a way that is more robust than we
could develop on our own! It is call (public-key
cryptography)[https://en.wikipedia.org/wiki/Public-key_cryptography] and
it provides all of the following:

- strong identity verification
- shared and private secrets

This type of system allows each device to have its own secret, private
key, that provides its unique identity. That private key is tied to a
public key. The public key can be used to encrypt messages that only the
private key holder can decrypt. In addition, the public key cannot be
used to derive the original private key. This functionality fits
perfectly for what our distributed system needs! Alas, public-key
cryptography introduces complex behaviors, setup and management. In the
next article, we will dive a little deeper into this topic. For now let
us take it on faith that it will serve our needs well.

#### Setting It Up

So we have decided that public-key cryptography is the answer. What does
that mean? What do I have to do? Let us explore what would need to be
done by a human or a piece of software automating this process. Don't
worry if you don't get all of this; the gist is all you need for now.
Later parts will expand upon this terminology. In fact, after reading
the later parts consider revisiting this part.

Consider the following diagram of a "mesh" distributed system. This
system has multiple pieces of software, all connecting amongst
themselves. Consider what it means to accomplish this using public-key
cryptography.

![Image of a simple mesh](./images/mesh.png)

In the diagram above, each system needs:

- a key pair for client & server connections
- to have the public keys of everyone it is connecting to

So what do we need to do? Drop into a CLI and start generating keys on
each machine. Do that by using these commands:

```
openssl ecparam -name secp256k1-genkey -param_enc explicit -out private-key.pem
```

```
openssl req -new -x509 -key private-key.pem -out server.pem -days 360
```

Voila - you now have a self-signed certificate that no one trusts. You
can repeat this for every piece of software in your mesh network, as it
initially will be deployed. Preferably, you log into each machine and
generate the private key there. Moving private keys on and off devices
is a security risk.

Then you will need to copy each public certificate to every other
machine and configure your software so that it trusts that certificate.
The system will need to repeat this process any time the system adds a
piece of software. If a machine is compromised, the analogous public
certificate will need to be untrusted on each node. To combat this
problem, Certificate Authorities (CA) can help!

#### CAs & Adding Complexity

A CA enables trust deferral from multiple individual certificates to a
single certificate. Meaning that instead of trusting each certificate,
each piece of software will trust the CA. The CA will be used to sign
every public certificate our software pieces need to use. How does
"signing" work? We will cover that in parts three and four, read on.

Here are the high-level steps:

1. create a CA configuration via OpenSSL CNF files
2. create the CA
3. use the CA's public key to sign all of the public certificates
4. distribute the CA's certificate to every machine
5. configure the machines certificate store or configure the software

For items one and two, the process can be a bit mystical. There are a
multitude of options involved in managing a CA. To perform number three,
you will need to go through the processing of creating CSRs on behalf of
the piece of software, and someone or something will have to play the
role of the CA and resolve the CSRs. The last two steps will depend on
the OS and software.

All of these actions can all be done via a CLI or programmatically. You
will have to spend time and energy, making sure the options are
correctly set and learning about all the different capabilities and
extensions. Mistakes will inevitably occur. It is time-consuming to
debug why a specific public certificate is not working as intended. The
tools and systems that use the certificates are purposely vague in error
messages as not to reveal too much information to attackers.

#### Further Concerns

Once configured, there are still other concerns need to be taken into
account:

- What happens when systems are removed/added?
- What happens when a certificate expires?
- How does a system know not to trust a certificate anymore?
- What happens when private keys need to regenerate?

CAs do not automatically handle the propagation of these types of
events. CAs are files on a storage device. Issuing or revoking
certificates does not generate any kind of event without additional
software. There is also the issue of certificates expiring. That "-days
360" puts a lifetime on each certificate. You could make that incredibly
long but exposes your system to having incredibly old certificates
around when encryption and the methods to defeat it have had ample time
to improve. Also, a private key's strength might need enhancement by
generating new keys. Replacing private keys is necessary when with the
advent of security vulnerabilities and improved cryptography. New
private keys automatically require new certificates.

Even if we ignore all of those concerns who did we trust to get this
system setup? Whatever or whoever that was was our seed of trust? So
far, you could have imagined that a human was doing all of this work. In
that case, you are trusting a human operator to properly configure all
of the systems while accessing the most sensitive parts of the process,
the private keys. The seed of trust is in that human. If this is a
software system performing these actions, that means that the system has
to be trusted and most likely have access to every other system coming
online. That is workable, but what happens when your system can have
people external to your system request to add software pieces to the
network. How can that be handled? How do you trust that system in the
first place to trust it? Using a secret password creates a single,
exploitable, weak point. Public-key cryptography could be put in place,
but then we are in and chicken-and-egg scenario. We are putting
public-key cryptography in place to put automate public-key
cryptography.

There are many caveats to bootstrapping trust. In a dynamic distributed
system where pieces of software can come at the whim of network
operators, the issues become a mountain of concerns. Thankfully in Ziti,
a mechanism is provided that abstracts all of this process.

---

Written By: Andrew Martinez  
June 2020
