---
title: "Pixy Dust For Web Applications"
seoTitle: "Pixy Dust For Web Applications (PKCE)"
seoDescription: "What is PKCE, and how does it enhance web app security? Read how OpenZiti BrowZer will automatically provide it for you."
date: 2024-04-04T16:38:22Z
cuid: clulgo2ea000109lc1lnq3tkx
slug: pixy-dust-for-web-applications-pkce
authors: [CurtTudor]
image: /blogs/openziti/v1707662249548/d6905ce3-a16a-4e08-8d81-5055a3da8bef.jpeg
tags: 
  - web
  - security
  - pkce
  - zerotrust
  - ziti

---

[PKCE](https://datatracker.ietf.org/doc/html/rfc7636), which stands for “**P**roof of **K**ey **C**ode **E**xchange”, and is pronounced “***pixy***,” is an extension of the OAuth 2.0 protocol that provides an additional security layer helping to prevent intercept attacks.

Articles about [OpenZiti](https://openziti.io/) often discuss application and network security, and this article will follow that trend.

<!-- truncate -->

Here I discuss how PKCE enhances the security of authorization code grant flows used in web applications. I will explore some benefits, best practices, and challenges of working with PKCE.

Perhaps best of all, I will also highlight how OpenZiti [BrowZer](https://blog.openziti.io/introducing-openziti-browzer) automatically brings you the power of PKCE... and how BrowZer facilitates an easy way to put a web-based cloak of invisibility around your application, further protecting it from malicious threat actors.

## Auth code grant flow security vulnerabilities

Before we discuss how PKCE works, let's first describe vulnerabilities that can be exploited in the authorization code grant flow.

When an authorization request is made, the authorization code grant type requires the authorization server (your preferred [IDP](https://en.wikipedia.org/wiki/Identity_provider)) to generate an authorization code, which is returned to the client application via a redirect URL. This code can then be exchanged for an access token, which can be used to access the user’s data.

An attacker can potentially intercept the authorization code that is sent back to the client and exchange it for an access token, which can cause serious data leaks or breaches.

One popular method malicious actors use to intercept authorization codes is by registering a malicious application on the user’s device (e.g. a browser extension). This malicious application will register and use the same custom URL scheme as the client application, allowing it to intercept redirect URLs on that URL scheme and extract the authorization code:

![](/blogs/openziti/v1707663725015/8e0798d9-2992-493b-9d28-34bcf57da8e8.png)

## **How does PKCE work?**

PKCE addresses the above vulnerability by introducing a new flow and three new parameters:

* `code verifier`
    
* `code challenge`
    
* `code challenge method`
    

Before an authorization request is made, the client creates and stores a secret called the `code verifier`. The `code verifier` is a cryptographically random string that the client uses to identify itself when exchanging an authorization code for an access token. It has a minimum length of 43 characters and a maximum length of 128 characters.

The client also generates a `code challenge`, which is a transformation of the `code verifier`. The `code challenge` is sent with the initial authorization request, along with a `code challenge method`. The `code challenge method` is the transformation mode used to generate the `code challenge`.

There are two code challenge methods that PKCE supports: `plain` and `S256`.

* `plain`**:**  
    In `plain` mode, the code challenge is equal to the code verifier; nothing changes.
    
* `S256`**:**  
    In `S256` mode, the SHA-256 hash of the code verifier is encoded using the BASE64URL encoding. The `S256` method is recommended by the specification and much preferred over the `plain` method.
    

Next, the `code challenge` is securely stored by the IDP, and an authorization code is returned with the redirect URL as usual.

When the client wants to exchange this authorization code for the access token, it sends a request that includes the initial `code verifier`. The server then hashes the `code verifier` using SHA-256 (*if it supports a*`code challenge methodS256`) and encodes the hashed value as a BASE64URL. The corresponding value is then compared to the `code challenge`. If they match, an access token is issued. Otherwise, an error message is returned.

This flow ensures that a malicious third party cannot exchange an authorization code for an access token, since the malicious application ***does not have the code verifier***.

Intercepting the `code challenge` is also useless because SHA256 is a one-way hashing algorithm and cannot be decrypted.

The following diagram represents the PKCE protocol flow:

![](/blogs/openziti/v1707664593271/95f591a4-717d-4626-a880-94e5a0657219.png)

## **PKCE Benefits**

PKCE offers many security benefits that have made it a widely adopted standard among developers that implement OAuth 2.0. These benefits include:

* **Eradication of code interception attacks:**  
    Without PKCE, an attacker who intercepts the authorization code can potentially exchange it for an access token. PKCE prevents this attack method by requiring a `code verifier` with every exchange, ensuring that only the original client that started the flow can obtain the token.
    
* **Backward compatibility:**  
    PKCE can be used with any IdP that supports it, while still being compatible with servers that do not. This is because PKCE is simply an extension of OAuth.
    
* **Standardization and wide adoption:**  
    PKCE has seen wide adoption, especially on mobile and [SPA's](https://en.wikipedia.org/wiki/Single-page_application), due to its tremendous security benefits.
    
* **Dynamic secrets:**  
    PKCE uses a dynamic secret that’s generated for each authorization request, which reduces the risk associated with a compromised client secret.
    

## **PKCE Best Practices**

If you are implementing a PKCE protocol flow, you should adhere to the following best practices to ensure that your application is properly secured:

* **Generate unique code verifiers:**  
    Each authorization request should contain a unique and dynamically generated `code verifier`. Always generating a new `code verifier` helps ensure that the `code challenge` is not predictable and helps prevent [replay attacks](https://en.wikipedia.org/wiki/Replay_attack).
    
    <mark>OpenZiti BrowZer always generates a dynamic/unique </mark> `code verifier` <mark> for you automatically.</mark>
    
* **Use high-entropy code verifiers:**  
    A `code verifier` should be generated using a cryptographically secure random generator, making it impossible to guess. It should have a minimum length of 43 characters and a maximum length of 128 characters.
    
    <mark>OpenZiti BrowZer uses a cryptographically strong random number generator to generate 32 random bytes and then encodes them to produce a 110-character </mark> `code verifier` <mark> for you automatically.</mark>
    
* **Use SHA-256 hashing:**  
    The `plaincode challenge method` should *only* be used if the client is unable to support the `S256` method. `S256` is a one-way hash, which further ensures that ***only*** the client that has the `code verifier` can exchange an authorization code for an access token.
    
    <mark>OpenZiti BrowZer implements </mark> `S256` <mark> code challenges for you automatically.</mark>
    
* **Implement time limits:** A `code verifier` and the transformed `code challenge` should have a short lifespan, which prevents them from being reused repeatedly.
    
    <mark>OpenZiti BrowZer implements unique, per-auth-attempt, ephemeral auth flows, and no security-related data is stored outside of session storage. The data only exists in session storage during the PKCE protocol flow (</mark>*<mark>typically less than one second</mark>*<mark>).</mark>
    

## **PKCE Implementation Challenges**

PKCE offers numerous benefits, but it still presents many challenges you should note if you attempt to implement it. These challenges include:

* **Algorithm compatibility:**  
    Different IDPs might support different hash algorithms for transforming a `code verifier` into a `code challenge`. This can make it difficult to ensure compatibility across different components.
    
    <mark>OpenZiti BrowZer manages this automatically (</mark>*<mark>and is compatible with many IDPs</mark>*<mark>).</mark>
    
* **Complexity:**  
    To be done correctly, PKCE certainly introduces additional complexity to the authorization code flow implementation. You must manage `code verifier` and `code challenge` data correctly as well as handle their transformations and comparisons securely.
    
    <mark>OpenZiti BrowZer manages this for you automatically.</mark>
    
* **Code verifier storage:**  
    PKCE requires the client to store the original `code verifier` until the authorization code is exchanged later in the protocol flow. Ensuring secure storage and retrieval of the `code verifier` can be challenging, especially for public clients (which all web browsers are).
    
    <mark>OpenZiti BrowZer manages this for you automatically (</mark>*<mark>in short-lived session storage</mark>*<mark>).</mark>
    
* **Security misconfiguration:**  
    Implementing PKCE incorrectly or failing to properly validate your `code challenge` will introduce the risk of security vulnerabilities. For instance, if the `code challenge` is not validated, attackers can forge counterfeit challenges and bypass security measures.
    
    <mark>OpenZiti BrowZer manages the </mark> `code challenge` <mark> data for you automatically.</mark>
    
* **Risk of overconfidence:**  
    While PKCE provides a strong security layer, it doesn’t eliminate the need for other security measures, such as secure communication (HTTPS), and proper access control.
    
    Relying solely on PKCE alone can lead to security gaps.
    
    <mark>In addition to </mark> ***<mark>everything</mark>*** <mark> discussed above, OpenZiti BrowZer allows you to make your web application </mark> ***<mark>completely invisible to threat actors</mark>*** <mark> while still giving your authorized users easy access.</mark>
    
    <mark>Authorized users who succeed with PKCE-based access to the overlay network that hosts your web app will also enjoy end-to-end encryption (</mark>**<mark>xchacha20poly1305</mark>**<mark>) of all data that transits between the browser and the web server, even before the data hits the wire. Once on the wire, the data will also have two more layers of encryption.</mark>
    

# **The Web *Cloak of Invisibility***

The tie-in between OpenZiti BrowZer and PKCE is how this kind of authorization flow is used to enable your authorized users (who exist out on the internet) to simply use a browser, and a couple of clicks, to gain visibility, and access, to a web application that is otherwise **completely invisible** to everyone else (notably, malicious actors).

You may recall that [BrowZer's zero-trust capabilities](https://blog.openziti.io/introducing-openziti-browzer#heading-authentication-in-a-browzer-environment) enforce an "*authenticate before connect*" flow. Users of your web app must first perform a successful **single sign-on** (SSO) that provides a strong assertion of the user's identity.

The Identity Provider (IDP) you associate with your network is up to you. It could be a cloud-based instance of AzureAD, Okta, or Auth0 (and these IDPs could even federate out to Google, GitHub, or dozens of other providers)...

![image.png](/blogs/openziti/v1662733522760/XoZApNB43.png?auto=compress,format&format=webp align="left")

...Alternatively, you can also self-host an open-source IDP instance of Keycloak, Authentik, ...whatever. If the IDP is OIDC-compliant, browZer will work with it.

BrowZer will automatically use all the PKCE mechanisms discussed earlier in this article when interacting with your IDP. You don't need to modify your web app in any way.

When the PKCE flow completes, the IDP delivers the access token, and BrowZer stores it locally in the browser's session storage.

e.g.:

![](/blogs/openziti/v1712246242470/0217910c-ed58-4963-a7b3-f76b1811ba30.png)

This access token is subsequently used to authenticate the user onto the Ziti Overlay network where your web app resides.

Note that although the user may have successfully authenticated with the IDP, the user represented by the IDP access token must *still* be known by the Ziti network.

If the user is not known by the Ziti network, the network authentication attempt will be rejected, and no access to the protected web app will occur.

"Authenticate before connect" literally means that a successful network authentication must occur before any web app connect attempts can succeed. If the Ziti network doesn't know who you are, the web app is invisible to you.

### Secure handling of the Access Token

For security reasons, the IDP access token is ***never*** persisted by BrowZer. The access token never leaves the browser's memory and is thus *ephemeral*.

The instant the browser Tab is closed, all session storage is purged by the browser, and the access token is gone forever. This makes the access token more secure and unavailable to bad actors who might somehow gain access to the user's laptop or mobile phone.

Access tokens also have an expiration time that IDP admins can configure to their preference (an hour, a day, etc). So even in the rare case where a user left a browser Tab open, and then somehow lost their device, the access token would eventually expire, BrowZer would detect this, and Ziti network access would immediately end.

# Wrap up

Do you host a web app and want to be invisible to malicious intruders?

Do you want your users to have easy access from anywhere with no additional software on their client devices?

Do you want to do all this without making any modifications to your web app?

If you are nodding yes, then we hope you'll [start a conversation with us about BrowZe](https://openziti.discourse.group/)r.

%%[curt-hs-test] 

%%[star-us-on-github]
