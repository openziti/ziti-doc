---
title: "Zitifying SCP"
date: 2021-08-12T14:45:18Z
cuid: cl475237g030diunv9eu78yn8
slug: zitifying-scp
authors: [ClintDovholuk]
image: /docs/blogs/openziti/5dcfe6cb113284b378817a8ad5878f98.jpeg
tags: 
  - security
  - zero-trust

---

In the [previous post](https://blog.openziti.io/zitifying-ssh) we talked about how we could take a well-known application and improve its security by zitifying it, producing `zssh`. The logical next step after zitifying `ssh` would be to extend the functionality of `zssh` to cover moving files securely as well, enter `zscp`. A zitified `scp` effectively creates a more secure command line tool for sending and receiving files between ziti-empowered devices. Once zitified, we can use `zscp` using ziti identity names just like we did in [zitifying ssh](https://blog.openziti.io/zitifying-ssh). I recommend reading the [previous article](https://blog.openziti.io/zitifying-ssh)) if you haven't to learn more about the benefits of zitifying tools like `ssh` and `scp`.

---

## First Things First

`zscp` functions with the same prerequisites as `zssh`:

* Establish a [Ziti Network](https://openziti.io/docs/learn/quickstarts/network/hosted)
    
* Create and enroll two Ziti Endpoints (one for our `ssh` server, one for the client)
    
    * the `sshd` server will run `ziti-tunnel` for this demonstration. Conveniently it will run on the same machine I used to setup the [Ziti Network](https://openziti.io/docs).
        
    * the client, in this case, is my local machine, and I'll `zscp` files both to and from the remote machine.
        
* Create the [Ziti Service](https://openziti.io/docs/learn/core-concepts/services/overview) we'll use and authorize the two endpoints to use this service
    
* Use the `zscp` binary from the client side and the `ziti-tunnel` binary from the serving side to connect
    
* Harden `sshd` further by removing port 22 from any internet-based firewall configuration (for example, from within the security-groups wizard in AWS) or by forcing `sshd` to only listen on `localhost/127.0.0.1`
    

After ensuring these steps are complete, you can copy files across your Ziti Network. The traffic will be even more secure since now a Ziti Network is required for the connection, requiring that strong identity before even being able to access the `sshd` server. And of course, now `sshd` is 'dark' - it no longer needs the typical port 22 to be exposed to any network.

Given all the prerequisites are satisfied, we can put `zscp` to use. Simply download the binary for your platform:

* [linux amd64](https://github.com/openziti-incubator/zssh/releases/latest/download/zscp-linux-amd64)
    
* [windows amd64](https://github.com/openziti-incubator/zssh/releases/latest/download/zscp-windows-amd64.exe)
    
* [macOs amd64](https://github.com/openziti-incubator/zssh/releases/latest/download/zscp-macos-amd64)
    
* [other](https://github.com/openziti-test-kitchen/zssh/releases/latest)
    

---

## Sending and Receiving Files with Zscp

Once you have the executable downloaded, make sure it is named `zscp` and for simplicity's sake we'll assume it's on the path. Just like `zssh` to `ssh`, `zscp` provides the same basic functionality as `scp`. As with most tooling, executing the binary with no arguments will display the expected usage.

There are two main functions of `zscp`. Just like `scp` you can send and receive from the remote host.

To send files we use this basic syntax:

`./zscp LOCAL_FILEPATHS... <REMOTE_USERNAME>@TARGET_IDENTITY:REMOTE_FILEPATH`

Then, to retrieve remote files we use a similar syntax:

`./zscp <REMOTE_USERNAME>@TARGET_IDENTITY:REMOTE_FILEPATH LOCAL_FILEPATH`

Below is a working example of using `zscp` to send a file to a remote machine. In this case the remote username is not the same as my local username. Just like with `scp`, I'll need to supply the username in my command and it will use the same syntax that regular `scp` uses. Here I am `zscp`'ing as username `ubuntu` to the remote computer that is joined to the Ziti Network using the identity named `ziti-tunnel-aws`.

./zscp local/1.txt ubuntu@ziti-tunnel-aws:remote INFO connection to edge router using token 6c2e8b79-ce8e-483e-a9f8-a930530e706a INFO sent file: /Users/name/local/1.txt ==&gt; /home/ubuntu/remote/1.txt

This is only a basic example on how we can use `zscp` to send a singular file to a remote computer. In the next section, we will go over how to use `zscp` flags for extended functionality.

---

## Zscp Flags

Just like `zssh`, `zscp` has the same flags to pass in: ssh key, ziti configuration file, service name, and one to toggle debug logging. All the defaults are the same as with `zssh`, thus both `zscp` and `zssh` will work without the `-i` and `-c` flag providing the files exist at the default locations. Refer to \[zitifying-ssh\]\[2\] for instructions on how to use the flags below.

\-i, --SshKeyPath string Path to ssh key. default: $HOME/.ssh/id\_rsa -c, --ZConfig string Path to ziti config file. default: $HOME/.ziti/zssh.json -d, --debug pass to enable additional debug information -s, --service string service name. (default "zssh")

In addition to the flags above, `zscp` has a flag to enable recursive copying:

\-r, --recursive pass to enable recursive file transfer

To use the recursive flag, you must input a directory into the `LOCAL_FILEPATH` argument. Just like `scp`, `zscp` will copy all file contents under the provided directory. You can see below how we can use the `-r` flag to send all contents of `big_directory`.

Contents of `big_directory` on local computer:

tree local local └── big\_directory ├── 1.txt ├── 2.txt ├── 3.txt ├── small\_directory1 │ └── 4.txt ├── small\_directory2 │ └── 5.txt └── small\_directory3 └── 6.txt

Here is the command and output:

$ zscp -r big\_directory ubuntu@ziti-tunnel-aws:remote INFO connection to edge router using token d6c268ee-e4f5-4836-bd38-2fc1558257aa INFO sent file: /Users/name/local/big\_directory/1.txt ==&gt; /home/ubuntu/remote/big\_directory/1.txt INFO sent file: /Users/name/local/big\_directory/2.txt ==&gt; /home/ubuntu/remote/big\_directory/2.txt INFO sent file: /Users/name/local/big\_directory/3.txt ==&gt; /home/ubuntu/remote/big\_directory/3.txt INFO sent file: /Users/name/local/big\_directory/small\_directory1/4.txt ==&gt; /home/ubuntu/remote/big\_directory/small\_directory1/4.txt INFO sent file: /Users/name/local/big\_directory/small\_directory2/5.txt ==&gt; /home/ubuntu/remote/big\_directory/small\_directory2/5.txt INFO sent file: /Users/name/local/big\_directory/small\_directory3/6.txt ==&gt; /home/ubuntu/remote/big\_directory/small\_directory3/6.txt

After `zssh'ing` to the remote machine, we can prove that all files have been transferred to remote device:

ubuntu@IP:~$ tree remote/ remote/ └── big\_directory ├── 1.txt ├── 2.txt ├── 3.txt ├── small\_directory1 │ └── 4.txt ├── small\_directory2 │ └── 5.txt └── small\_directory3 └── 6.txt

Recursive copying also works to retrieve all contents of a directory on the remote machine.

---

I hope this post has helped you get familiar with another ziti-empowered developer's tool and hopefully it's becoming more clear why zitifying your application will make it more resilient to attack and make the act of connecting to remote services trivial.

Have a look at the code over at [GitHub](https://github.com/openziti-test-kitchen/zssh/blob/main/zssh/zscp/main.go) or continue reading on to the next zitification - [kubectl](https://blog.openziti.io/kubernetes)!
