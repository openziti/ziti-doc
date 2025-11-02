---
slug: mobile-point-of-sale-mpos-app-ziti-android-java-sdk-integration
title: "Mobile Point of Sale (mPOS) app – embed zero trust networking"
authors: [CurtTudor]
date: 2020-03-19
tags:
  - mobile
  - zero-trust
  - android
  - java
  - sdk
---

## Mobile Point of Sale (mPOS) app – embed zero trust networking

_Written with Sagarkumar S of Enlume Technologies_

Point of sale application developers and solution providers need to provide secure, reliable applications to retailers.  However, retailers need to create duplicate networks with extra hardware and configuration to separate their point of sale (POS) data for PCI compliance.  **Now, there is a better way.  Use the simple Ziti SDKs to embed zero trust networking, inside the POS app, so that the POS app is secure on any network - micro-segmented and zero trust.**

<!-- truncate -->

This blog summarizes use of the Ziti SDK in a mobile point of sale application (mPOS) that is based on Java and built specifically for Android tablets and phones.  Ziti SDKs can also be used for Apple iOS, Mac, Windows and Linux environments.

This is a relatively simple mPOS application with the front-end mobile application written in Java.  The backend application features a mongo DB cluster that is used as a repository of merchant transactions. The application server side can also use the Ziti zero trust, cloud native networking for simple, secure integrations with banking providers (not in scope for this post).

![](/blogs/openziti/v1653224174107/oS2wUTgbT.png)

The basic use of the mPOS solution:

1\. Merchant initiates a sale transaction (pull mode) with customer phone number to send an OTP.

2.Customer receives the OTP number and enters in mPOS app to complete the transaction.

3.The transaction summary is updated in the mPOS app

4.Dashboard on application server records the transaction into mongo DB

Technologies used:

*   Mobile Apps Front end (mPOS for Merchant)
*   Java SDKs and Android app
*   Server side for Mobile
*   Node JS
*   MongoDB
*   Dashboard on Transactions
*   Angular 6
*   Ziti SDK

_Prerequisite_ : Read the [Quickstart guide](https://netfoundry.github.io/ziti-doc/ziti/quickstarts/quickstart-overview.html) and have access to the Ziti virtual gateway deployed in your cloud environment (pre-built versions in GCP, AWS and Azure marketplaces, with images available for other platforms).

### Configuring Ziti zero trust networking for mPOS

#### Configure a zero trust service in minutes

In simple terms, this is how you tell Ziti where your backend server is located

Name - _Name of your Service_

Ziti Router - _the last Ziti Router traffic will be sent to select default_

Intercepting Host and Port - what DNS name or IP you wish to use Ziti to optimize Eg : **backend-server**

Endpoint Service - 

*   Protocol : If you are consuming rest API, select TCP
*   Host : Provide your backend server IP address 
*   Port : Provide the port on which your server is running

Cluster - select the default

Identity - Leave as it is

Sample reference configuration:

![](/blogs/openziti/v1653224176290/BCbr4KcjC.png)

### Create Identity

This is for secure authentication between your Ziti network and your mPOS or other application. 

*   Create a new identity from Ziti admin console (web)
    *   Name - Name of identity Eg ;  Device1
    *   Identity Type - Device
*   Leave the rest of the fields as it is
*   Download the token from the list of identities. This is a JWT token which we will use later to securely enroll with our Ziti network.

### Configure AppWANs

This is policy based management of authorization between your seucre identities and your Ziti Services - determines which devices or users you want to authorize to use which services, in a least privileged access architecture.

*   Create a new AppWAN from Ziti web console
*   Link the identity and service configured earlier

### Integrate SDK in Android App

Buildscript → repositories
```
mavenCentral()

maven \{ url = **"https://netfoundry.jfrog.io/netfoundry/ziti-maven"**  \}
```

### Add Ziti Dependency

In your Android studio,  project-level build.gradle file add ziti repositories as follows :

```
Buildscript → repositories
mavenCentral()
maven { url = "https://netfoundry.jfrog.io/netfoundry/ziti-maven"  }

Allprojects  → repositories
mavenCentral()
maven { url = "https://netfoundry.jfrog.io/netfoundry/ziti-maven"  }
```

Add dependency in module level build.gradle file as follows :

    dependencies
    implementation "io.netfoundry.ziti:ziti:0.+"

### Initialize Ziti

Ziti should be initialized when you launch your app so place the following code appropriate to your project.

```
    private KeyStore ks;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
       ks = KeyStore.getInstance("AndroidKeyStore");
       ks.load(null);
       // Initialize Ziti
       Ziti.init(ks, true);

```

Ziti Init returns List `<ZitiContext>`  Object  so if the list is empty it means that device is not enrolled to Ziti network.

### Enroll Identity

To enroll application you need to call the following method :

Ziti._enroll_(**ks**, jwt, name);

*   Ks is the keystore. 
*   Jwt is the token we obtained from the downloaded file from identity 
*   name is the name of the android device.

Referring to the Service in the mobile app: 

Now that the device is enrolled and Ziti initialized, you can refer to the application service via Ziti service name using the service host name configured earlier - [**http://backend-server/api**](http://backend-server/api)

**That's it! We have successfully embedded zero trust networking inside our point of sale app.  Now it will be secure on any device and any network.**

Github source code repo: [https://github.com/netfoundry/ziti-demos-mpos](https://github.com/netfoundry/ziti-demos-mpos)