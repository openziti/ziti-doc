---
title: "My Intern Assignment - Call a Dark Webhook from AWS Lambda"
seoTitle: "Zero trust webhook from AWS Lambda"
seoDescription: "As an intern I used OpenZiti to invoke a webhook to a server over a zero trust, OpenZiti network"
date: 2022-08-25T01:11:42Z
cuid: cl78cngvf02tr36nvc56efb0j
slug: my-intern-assignment-call-a-dark-webhook-from-aws-lambda
authors: [ClintDovholuk]
image: /blogs/openziti/kOMCC0op3.jpeg
tags: 
  - webhooks
  - aws-lambda
  - zerotrust

---

*Published by Clint on behalf of Spencer Griebel*

# The Intern

This summer, I had the pleasure of working at NetFoundry, a company that is trying to keep the world secure by providing and supporting a totally free and open source, zero trust overlay network called OpenZiti. OpenZiti is on GitHub, you can go and fork it right now and run your own network if you like. Since I worked for NetFoundry, I was able to use their SaaS offering for free and let them manage the OpenZiti overlay (which you could also do too if interested, they have a free tier).

## The Assignment

Naturally, as the summer intern responsible for odd jobs, I was tasked with creating a script to automate finding CVEs that OpenZiti could quickly solve - i.e., CVEs that, from their CVSS metrics, have an attack vector of network and no privileges required. The zero trust overlay network OpenZiti provides allows you to close any and all open ports from your servers. That means firewalls only require outbound connectivity, nothing inbound at all, blocking unknown attackers from accessing your data on your network (as well as a bunch of other [superpowers](https://www.youtube.com/playlist?list=PLMUj_5fklasKF1oisSSuLwSzLVxuL9JbC)).

OpenZiti has a mascot, a cute and friendly piece of pasta, Ziggy. Ziggy also has a [Twitter handle](https://twitter.com/openziggy) and he likes to tweet about CVEs which OpenZiti could have easily solved or at least reduced the impact of and he likes to tell the world to keep your ports closed. I was tasked with finding these CVEs so that Ziggy could alert the world to the CVE. This allows Ziggy to promote the CVE to the world while simultaneously showing how OpenZiti could solve the problem entirely, or at very least reduce the effect of the CVE to only trusted identities on your network. After all, someone on your zero trust overlay is far less likely to exploit the flaw. After discovering these CVEs, I then needed to be able to post the CVE to a channel on the [Mattermost](https://mattermost.com/) messaging server, alerting people of the CVE.

## The Problem

So far, this all sounds pretty straightforward. The twist is that NetFoundry uses OpenZiti to protect its Mattermost server. That means I can’t just hit a public webhook, the webhook isn’t public at all. I’d have to get a strong identity and get onto the overlay network in order to even access the webhook endpoint.

## Background

*If you know what a CVE is or what CVSS is or you don’t want to learn, skip the next couple of paragraphs.*

### What’s a CVE

At this point, you might be asking yourself, what’s a CVE? I didn’t know either. A CVE is a vulnerability that has been discovered and cataloged. They are also called ["0-day"/"Oh-day"/"Zero-day"](https://en.wikipedia.org/wiki/Zero-day_(computing)), bugs, vulnerabilities, etc. Each CVE has an associated entry, including a description of the CVE and the [CVSS score](https://nvd.nist.gov/vuln-metrics/cvss). These scores, determined via criteria, categorize the severity of the CVE. Fortunately for us, I found that these CVEs are all collected and posted by NIST and are easily accessible using their [public API](https://nvd.nist.gov/vuln/data-feeds).

### CVSS?

This might surprise you, I didn’t know what CVSS was either. As I mentioned previously, CVSS is a way of scoring the CVE. CVSS stands for “Common Vulnerability Scoring System” and the latest version, version 3.1, is the one we focused on. CVSS takes eight common properties of the vulnerability and somehow (I didn’t research how) uses the results to calculate a score from 0.0 to 10.0, with 10.0 being a show-stopper, you really need to patch this vulnerability immediately! Anything over a 9 is really critical, but a 10.0 is earth-shattering. As an example, you almost certainly heard about “[log4shell](https://en.wikipedia.org/wiki/Log4Shell)”? Here’s the [NIST CVE for log4shell](https://nvd.nist.gov/vuln/detail/CVE-2021-44228). As you can see, it was a 10.0, ooph.

![image.png](/blog/v1661374704921/4dfRMttjq.png align="left")

As mentioned, the CVSS is calculated using eight different fields. The two fields I focused on were the “Attack Vector” and the “Privileges Required” fields. You can see from the log4shell CVE that when the attack vector is network, and the privileges required are none, you already have a particularly sensitive CVE to mitigate. These sorts of CVEs are exploited routinely by attackers as it often permits them to “land and expand”. If you’re interested in playing around with CVSS, there are at least two really good calculators, one [from NIST itself](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator), and the other from [first.org](https://www.first.org/cvss/), try it out.

## Back to the Assignment

Ok, now I knew what a CVE is and what the CVSS score is, and what types of vulnerabilities I needed to look for. I also knew that NIST provides a list of these CVEs via their API which also provides decent filtering capabilities. Now I knew where I could find these CVEs but I still had to set up a recurring job to notify the Mattermost channel. I rolled up my sleeves and started at it.

I wrote the initial script using Python in VScode. I already had it in my head that the final goal would be automating it to run every 15 minutes using [AWS Lambda](https://aws.amazon.com/lambda/). The script itself was pretty simple. I would make a REST API call to the NIST CVE database with a few filters in the API URL (no permissions required, attack vector of network). I also added a filter to narrow the date range and search for specific categories of CVEs. I tested everything and it seemed to work to gather the information we need. I tweaked the code to send a nicely formatted message so that it looked nice - a vital feature of the solution. Now I need to send a webhook message to our private Mattermost chat server.

## Calling a “Dark” Webhook

Awesome, now I had a script that can gather the necessary information from the database. I also figured out how to format each CVE into an easily readable message and figured out how to send that message to a webhook in Mattermost to a specific channel when the Mattermost server was not dark, meaning it was actively listening on a port and my script could send a message directly to the server. Getting that done was easy, but in order to keep this implementation NetFoundry would need to open a port for the firewall for an incoming webhook and that would have defeated the purpose of having the Mattermost server protected by OpenZiti. We didn’t want to have an open port in the firewall, so this solution really wasn’t an option.

Luckily, when I finished the script's first revision, the OpenZiti project had just released its [Python SDK](https://github.com/openziti/ziti-sdk-py). I decided I would inject my script with some embedded zero trust superpowers. This was exactly what I needed to grant my AWS Lambda the superpower of invoking a dark webhook.

## Adding Zero Trust to the Lambda

![](/blog/v1661429495524/R5PsrBJou.png align="left")

The process to '[zitify](https://blog.openziti.io/zitification)' the script (i.e., put an OpenZiti SDK inside) is very straightforward and was so simple even an intern could do it! First, I received an OpenZiti strong identity which was authorized to hook into the Mattermost server. I enrolled it using the OpenZiti [Command Line Interface (CLI)](https://openziti.github.io/ziti/identities/enrolling.html) using one command. From that, I received a JSON file containing the enrolled, strong identity. I stored this JSON document using AWS secrets manager which is easily accessed from AWS Lambda. In my Lambda script, I created an environment variable named "ZITI\_IDENTITIES", which stores the path to a file containing the JSON from the enrolled identity. Note that the name of this variable is specific and must be used when zitifying a python script using the SDK. Initially, this file did not exist, so when running the script, I had it create the file, pull the identity JSON from AWS Secrets Manager, and populate the new file. After that, I imported the OpenZiti SDK, which validates the identity provided.

#### The Code:

![image.png](/blog/v1661374430916/EE4XTdpby.png align="left")

Check out the actual code over on github at https://github.com/openziti-test-kitchen/ziggy-fodder/blob/main/cve-alert-zitified.py

Once I had OpenZiti imported, it was as simple as using the openziti.monkeypatch() method and using the requests package to use the webhook as I did before.

*When OpenZiti is imported, it attempts to validate the identity pointed to by the ZITI\_IDENTITIES env variable. Remember that this file is initially empty with my script, so I had to break convention and import OpenZiti later in my script. This could be easily avoided by not using Secrets Manager to store the identity or by having an initialization script that loads the environment variable.*

## Solution Overview

With my Lambda zitified, now the communication looks like this. No holes in the private data center are needed and the Lambda can send webhook payloads every 15 minutes successfully. The solution looks like this:

![](/blog/v1661374132819/pMR9FS30j.png align="left")

## Reflections on the Process

Overall the process was easy and smooth and though my script was straightforward, the process would be the same for a more complicated program. The bulk of the work came from storing the identity and placing it where the OpenZiti package would be able to find it. After that, I could take advantage of the benefits provided by OpenZiti with little work.

## The Payoff

![image.png](/blog/v1661374025216/lNxwSTAja.png align="left")

And there it is. Now, with our new zitified CVE finding script, [Ziggy](https://twitter.com/OpenZiggy) has a constantly growing feed of CVEs he can comment on. This image shows the Mattermost channel where all the CVEs appear and shows you what the messages look like when formatted. Each number hyperlinks to the page with more details - see [an example](https://nvd.nist.gov/vuln/detail/CVE-2022-36272). Overall this was an enjoyable project and a great introduction to AWS Lambda and using OpenZiti.

If you made it to the end and thought the OpenZiti project sounds neat - [give them a star over on GitHub](https://github.com/openziti/ziti/stargazers) and help spread the word about this awesome project. :)
