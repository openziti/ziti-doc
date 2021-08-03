# Zitifying Scp

The next step of creating ziti secured development tools is zitifying ssh’s `scp` creating `zscp`. This effectively creates a more secure command line tool for sending and receiving files between ziti empowered devices. We can use `zscp` for more secure and easy network administration using ziti identity names just like we went over in [zitifying ssh](zitifying-ssh.md). I recommend reading the previous article first ([zitifying ssh](zitifying-ssh.md)) if you haven't to learn the more in depth benifits of zitifying tools like `ssh` and `scp`. 

<hr>

## First Things First

`zscp` functions with the same prerequisites as `zssh`:

- Establish a [Ziti Network in AWS](https://github.com/openziti/ziti/blob/release-next/quickstart/aws.md) (using AWS in
  this example)
- Create and enroll two Ziti Endpoints (one for our `ssh` server, one for the client)
    * the `sshd` server will run `ziti-tunnel` for this demonstration. Conveniently it will run on the same machine I
      used to setup the [Ziti Network](https://openziti.github.io/ziti/overview.html#overview-of-a-ziti-network).
    * the client in this case will run `zscp` from my local machine and I'll `zscp` files to and from both the zscp client side and remote tunneled server side.
- Create the [Ziti Service](https://openziti.github.io/ziti/services/overview.html) we'll use and authorize the two
  endpoints to use this service
- Use the `zscp` binary from the client side and the `ziti-tunnel` binary from the serving side to connect
- Harden `sshd` further by removing port 22 from any internet-based firewall configuration (for example, from within the
  security-groups wizard in AWS) or by forcing `sshd` to only listen on `localhost/127.0.0.1`


After ensuring these steps are complete, you will have the ability to copy and send files with maximum protection across your ziti network. The file traffic will be more secure given the ziti is required for the connection, and sshd is not listening on its typical port 22.

Given all the prerequisites are satisfied, we can put `zscp` to use. Simply download the binary for your platform:

- [linux](https://github.com/openziti-incubator/zssh/releases/download/latest-tag/zscp-linux-amd64)
- [windows](https://github.com/openziti-incubator/zssh/releases/download/latest-tag/zssh-windows-amd64.exe)
- [MacOs](https://github.com/openziti-incubator/zssh/releases/download/latest-tag/zssh-macos-amd64)

<hr>


## Sending and Receiving Files with Zscp

Once you have the executable download, make sure it is named `zscp` and for simplicity's sake we'll assume it's on the
path. Just like `zssh` to `ssh`, `zscp` has the same functionality as `scp` with added features needed incorporate ziti. As with most tooling executing the binary with no arguments will display the expected usage.

There are two main functions of `zscp`. Just like `scp` you can send and receive from the remote host. 

To send files we use this basic syntax:
	
	./zscp LOCAL_FILEPATHS... <REMOTE_USERNAME>@<TARGET_IDENTITY>:REMOTE_FILEPATH

Then, to retrieve remote files we use this syntax:

	./zscp <REMOTE_USERNAME>@<TARGET_IDENTITY>:REMOTE_FILEPATH LOCAL_FILEPATH

Below is a working example of using `zscp` to send a file to the remote user `ubuntu` on the the computer `ziti-tunnel-aws`.

	./zscp local/1.txt ubuntu@ziti-tunnel-aws:remote 
	INFO 	connection to edge router using token 6c2e8b79-ce8e-483e-a9f8-a930530e706a
	INFO 	sent file: /Users/name/local/1.txt ==> /home/ubuntu/remote/1.txt

This is only a basic example on how we can use `zscp` to send a singular file to a remote computer. In the next section, we will go over how to use `zscp` flags for extended functionality.

<hr>

## Zscp Flags

Just like `zssh`, `zscp` has the same flags to pass in an ssh key, ziti configuration file, service name, and to toggle debug logging. All the default paths are the same as `zssh`, thus both `zscp` and `zssh` will work without the `-i` and `-c` flag, if the file default file-paths exist. Refer to [zssh](zitifying-ssh.md) for instructions on how to use to flags below. 

    -i, --SshKeyPath string   Path to ssh key. default: $HOME/.ssh/id_rsa
    -c, --ZConfig string      Path to ziti config file. default: $HOME/.ziti/zssh.json
    -d, --debug               pass to enable additional debug information
    -s, --service string      service name. (default "zssh")
    
In addition to the flags above, `zscp` has a flag for recursive copying:

	-r, --recursive           pass to enable recursive file transfer
	
To use the recursive flag, you must input a directory into the `LOCAL_FILEPATH` argument. Just like `scp`, `zscp` will copy all file contents under the provided directory. You can see below how we can use the `-r` flag to send all contents of `big_directory`. 

Contents of `big_directory` on local computer:	
	
	tree local
	local
	└── big_directory
	    ├── 1.txt
	    ├── 2.txt
	    ├── 3.txt
	    ├── small_directory1
	    │   └── 4.txt
	    ├── small_directory2
	    │   └── 5.txt
	    └── small_directory3
	        └── 6.txt
	   
	        
Here is the command and output:
	
	$ zscp -r big_directory ubuntu@ziti-tunnel-aws:remote
	INFO 	connection to edge router using token d6c268ee-e4f5-4836-bd38-2fc1558257aa
	INFO 	sent file: /Users/name/local/big_directory/1.txt ==> /home/ubuntu/remote/big_directory/1.txt
	INFO 	sent file: /Users/name/local/big_directory/2.txt ==> /home/ubuntu/remote/big_directory/2.txt
	INFO 	sent file: /Users/name/local/big_directory/3.txt ==> /home/ubuntu/remote/big_directory/3.txt
	INFO 	sent file: /Users/name/local/big_directory/small_directory1/4.txt ==> /home/ubuntu/remote/big_directory/small_directory1/4.txt
	INFO 	sent file: /Users/name/local/big_directory/small_directory2/5.txt ==> /home/ubuntu/remote/big_directory/small_directory2/5.txt
	INFO 	sent file: /Users/name/local/big_directory/small_directory3/6.txt ==> /home/ubuntu/remote/big_directory/small_directory3/6.txt
	
Proof that all files have been transferred to remote device:

	ubuntu@IP:~$ tree remote/
	remote/
	└── big_directory
	    ├── 1.txt
	    ├── 2.txt
	    ├── 3.txt
	    ├── small_directory1
	    │   └── 4.txt
	    ├── small_directory2
	    │   └── 5.txt
	    └── small_directory3
	        └── 6.txt
  
Recursive copying also works to retrieve all contents of a directory on the remote machine.

<hr>

I hope this post helped you get familiar with another ziti empowered developer's tool and showed how zitifying your code can make it more _POWERFUL_ and _SECURE_. 
