---
title: "Using eBPF-TC to securely mangle packets in the kernel, and pass them to my secure networking application"
seoDescription: "This article described how I leveraged eBPF-TC to build a Plugin TPROXY IFW to steer traffic to my target application."
date: 2022-11-09T22:10:42Z
cuid: claa73b5k000509l012jsa3ic
slug: using-ebpf-tc-to-securely-mangle-packets-in-the-kernel-and-pass-them-to-my-secure-networking-application
authors: [RobertCaamano]
image: /blogs/openziti/v1668008121762/C4XmMYoVT.jpg
tags: 
  - opensource
  - firewall
  - openziti
  - ebpf
  - tc
  - tproxy

---

## Introduction

eBPF enables you to safely run sandboxed programs for functions like security and networking in the OS kernel, without 
changing kernel source code or loading kernel modules. eBPF-TC specifically has robust packet mangling capability, and 
enables ingress and egress operations, with high performance.

<!-- truncate -->

This is how I used TC-eBPF to build a Plugin TPROXY Interception Firewall (IFW) to intercept and deliver packets to my target application - OpenZiti Edge Routers. You can use a similar eBPF-TC implementation to intercept packets to send to your specific observability, security or networking application. The code is here: [https://github.com/netfoundry/zfw](https://github.com/netfoundry/zfw). Process flow and packet flow diagrams are at the end of this article.

## Project context – passing packets to OpenZiti endpoints

OpenZiti (open source zero trust networking platform) enables private connections across full mesh Internet overlay networks. Ziti endpoints are embedded in applications as code (via Ziti SDKs), and deployed as OS agents, daemons, containers or VMs. You can spin up any number of Ziti routers in your private mesh - it looks like this if you deploy two routers:

![OpenZiti End to End Encryption Terminating at the Routers](/blogs/openziti/v1668007504136/qJTZ9uPxE.png)

Ziti Edge Routers are often used on Linux and default to iptables to map incoming interesting traffic toward service listening ports using [IP Table Tproxy Target](https://docs.kernel.org/networking/tproxy.html). This works great if for example you are running Ubuntu and FWD. However, there are many Linux distros with key variances. I therefore used TC-eBPF to build a more universal option for Linux distros which support eBPF, enabling those distros to intercept traffic of interest. The eBPF feature set also enabled additional packet filtering and manipulation not natively supported in iptables/nftables.

## TC-eBPF IFW – tproxy target entries

So before diving into building the eBPF IFW I needed to reverse engineer how OpenZiti edge-routers natively translate services into iptables rules - which TPROXY target statements need to be added/deleted based on services the router learned from the OpenZiti Controller. The following is the information used to create the tproxy target entries via iptables.

```plaintext
IP Destination Prefix: Dotted Decimal IP/mask bit-length
TCP/UDP port range in the format Decimal Low_Port:High_Port
Protocol: TCP/UDP
TPROXY Listening port: Decimal port
```

## TC-eBPF IFW – insertion and mapping

So now with this information I could start thinking about the eBPF map types and structures that I would use to communicate between a user space mapping tool and the IFW to dynamically update rules.

Since I wanted my program to act function similarly to ufw/iptables I chose TC-eBPF as my insertion point due to the combination of its attachment at the interface level (ability to drop packets before forwarding to the Linux IP stack), and the currently available sk helpers for socket lookup/splicing.

In order to check if an incoming packet matches an intercept policy created by a Ziti network administrator (Ziti intercepts specifically defined flows – doesn’t default to intercepting all flows), I needed a pinned map that supported a struct key type. A a eBPF hash map which allows for struct as a key gave me the flexibility to customize the lookup and add or delete criteria as use cases evolve. Using pinned maps allows multiple copies of the ebpf program to run (One on each inbound interface) and share the map updated by the mapping tool/Ziti.

Depicted below is the initial map definition I chose:

```plaintext
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(id, BPF_MAP_ID_IFINDEX_IP);
    __uint(key_size, sizeof(uint32_t));
    __uint(value_size, sizeof(struct ifindex_ip4));
    __uint(max_entries, 50);
    __uint(pinning, LIBBPF_PIN_BY_NAME);
} ifindex_ip_map SEC(".maps");
The initial key I chose a struct of the following form:
struct tproxy_key {
    __u32 dst_ip;
    __u16 prefix_len;
    __u16 protocol;
} 
These data structures allow for a lookup based on destination ip prefix, cidr length, and ip protocol(tcp/udp) which can all be decerned from the incoming packet. 
For value I used a struct of the following format:
struct tproxy_tuple {
   __u16 index_len; /*tracks the number of entries in the index_table*/
   __u16 index_table[MAX_INDEX_ENTRIES];/* Array used as index table which points to    
Struct *tproxy_port_mapping in the     
port_maping array with each poulated
index representing a udp or tcp tproxy     
mapping in the port_mapping
                                         */
struct tproxy_port_mapping port_mapping[MAX_TABLE_SIZE];/* Array to store unique   
tproxy mappings
with each index match   
the low_port of the
struct  tproxy_port_mapping{
__u16 low_port;
__u16 high_port;
__u16 tproxy_port;
__u32 tproxy_ip;
}*/
}
```

Since OpenZiti IP based service policies can be defined at any level of granularity, including network CIDR blocks, I did not want to have to generate hash entries for every host address in contained in a block. I therefore implemented a longest match lookup algorithm that successively widens the mask checking to see if an incoming IP tuple either directly matches a host address or falls within a CIDR block range that matches the ip\_dest / prefix\_len fields in the tproxy\_key along with matching IP transport protocol (TCP or UDP).

```javascript
struct tproxy_tuple *tproxy
__u32 exponent=24;  /* unsugend integer used to calulate prefix matches */
__u32 mask = 0xffffffff;  /* starting mask value used in prefix match calculation */
__u16 maxlen = 32; /* max number ip ipv4 prefixes */
 
for (__u16 count = 0;count <= maxlen; count++){
    struct tproxy_key key = {(tuple->ipv4.daddr & mask), maxlen-count,protocol}
    if ((tproxy = get_tproxy(key))){
            { Redacted for brevity}
           
    /*algorithm used to calucate mask while traversing each octet.*/
    if(mask == 0x00ffffff){
       exponent=16;
    }
    if(mask == 0x0000ffff){
       exponent=8;
    }
    if(mask == 0x000000ff){
       exponent=0;
    }
    if(mask == 0x00000080){
       return TC_ACT_SHOT;
    }
    if((mask >= 0x80ffffff) && (exponent >= 24)){
       mask = mask - (1 << exponent);
    }else if((mask >= 0x0080ffff) && (exponent >= 16)){
       mask = mask - (1 << exponent);
    }else if((mask >= 0x000080ff) && (exponent >= 8)){
       mask = mask - (1 << exponent);
    }else if((mask >= 0x00000080) && (exponent >= 0)){
       mask = mask - (1 << exponent);
            }
    exponent++;
}
```

Further, since a Ziti end user can associate any number of port ranges to a destination on a per protocol basis, in this first pass I did not want to create an entry in the hash map for every port given the potential for large port ranges i.e 1-65535. Instead, I created an index table in which each entry points to a populated array index in the port\_mapping table where the index is the low\_port value of the mapped rule. This limits the search for a port match to only populated port range entries vs sequential index searches directly in the port mapping table. I plan to test the performance and resource limitation of creating hash map entries for every member port vs indexed lookup of range start. Below is a code snippet of the lookup used to find a match based on the incoming tuple-&gt;ipv4.dport

```javascript
for (int index = 0; index < max_entries; index++) {
    /* set port_key equal to the port value stored at current Index */
    int port_key = tproxy->index_table[index];
    /*
check if tuple destination port is greater than low port and lower than high    
port at mapping[port_key]
if matched get associated tproxy port and attempt to find listening socket
if successfull jump to assign:
   */
     if ((bpf_ntohs(tuple->ipv4.dport) >= bpf_ntohs(tproxy->port_mapping[port_key].low_port))
          && (bpf_ntohs(tuple->ipv4.dport) <=bpf_ntohs(tproxy>port_mapping[port_key].high_port))){               
          If(local){ /* if tuple->daddr == router’s ip then forward to stack */
              return TC_ACT_OK;
         }
         /* construct tuple to used to lookup TPROXY sk */
         sockcheck.ipv4.daddr = tproxy->port_mapping[port_key].tproxy_ip;
         sockcheck.ipv4.dport = tproxy->port_mapping[port_key].tproxy_port;
         /* look up sk based on protocol in map key */
         if(protocol == 6){
              sk = bpf_skc_lookup_tcp(skb, &sockcheck, sizeof(sockcheck.ipv4),
                 BPF_F_CURRENT_NETNS, 0);
         }else{
             sk = bpf_sk_lookup_udp(skb, &sockcheck,  sizeof(sockcheck.ipv4),
                 BPF_F_CURRENT_NETNS, 0);
         }  
         if(!sk){
             return TC_ACT_SHOT;
         }  
         if((protocol == IPPROTO_TCP) && (sk->state != BPF_TCP_LISTEN)){
             bpf_sk_release(sk);
             return TC_ACT_SHOT;
         }
         goto assign;
     }
}
assign:
    /*attempt to splice the skb to the tproxy or local socket*/
    ret = bpf_sk_assign(skb, sk, 0);
    /*release sk*/
    if(ret == 0){
       //if succedded forward to the stack
       return TC_ACT_OK;
    }   
    /*else drop packet if not running on loopback*/
    if(skb->ingress_ifindex == 1){
        return TC_ACT_OK;
    }else{
        return TC_ACT_SHOT;
    }
}
```

## TC-eBPF – Stateful Firewall

Since I wanted eBPF to perform the functionality of a stateful firewall (At least to the extent that there must be an active outbound session to a host for acknowledged packets to be accepted from that host), I needed to consider how to allow the program to manage session states for both UDP and TCP. I initially thought that this might be complicated. However, while working with the ebpf helpers used to splice sockets together, I realized that the same helpers could be used to check to see if an outgoing sockets had been initiated. In the case that an incoming packet tuple matched an existing outgoing session, splice the incoming skb to the existing sk while performing the same lookup that the program was already performing for the OpenAiti service tproxy sk(s). The following code excerpts shows the basic state inspection code I used for TCP:

```javascript
/* if tcp based tuple implement statefull inspection to see if they were
initiated by the local OS if not pass on to tproxy logic to determin if the OpenZiti router has tproxy 
intercepts defined for the flow
 */
sk = bpf_skc_lookup_tcp(skb, tuple, tuple_len,BPF_F_CURRENT_NETNS, 0);
if(sk){
  if (sk->state != BPF_TCP_LISTEN){
     goto assign;
  }
  bpf_sk_release(sk);
}

assign:
    /*attempt to splice the skb to the tproxy or local socket*/
    ret = bpf_sk_assign(skb, sk, 0);
    /*release sk*/
    if(ret == 0){
       //if succeeded forward to the stack
       return TC_ACT_OK;
    }   
/*else drop packet if not running on loopback*/
    if(skb->ingress_ifindex == 1){
        return TC_ACT_OK;
    }else{
        return TC_ACT_SHOT;
    }
}
```

## TC-eBPF IFW – SSH inbound

Taking things, a step further I wanted to allow ssh inbound by default, but wanted to restrict ssh to only the IP address of the external interface which the eBPF program was attached. However, when running eBPF at the TC level you do not have access to the interface’s IP address. Having this functionality is essential to support ssh services over Ziti when using the standard port since the services would also have a destination port of TCP/22. So, without being able to discern the router’s IP, the program would not know whether to forward to the Linux stack or to Ziti Tproxy service ports. To solve this, I initially allow ssh to pass to any address, and then let my user space zfw app inform eBPF what its attached IP is via a bpf hash map. I did this by having the user space app use the ifindex as the hash map key and then then store the IP address in a struct with the IP Address array as one of its fields. Specifically, the map and structs I created are as follows:

```plaintext
/* hash Map */
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(key_size, sizeof(uint32_t));
    __uint(value_size, sizeof(struct ifindex_ip4));
    __uint(max_entries, MAX_IF_ENTRIES);
    __uint(pinning, LIBBPF_PIN_BY_NAME);
    __uint(map_flags, BPF_F_NO_PREALLOC);
} ifindex_ip_map SEC(".maps");
 
/*value to ifindex_ip_map*/
struct ifindex_ip4 {
    uint32_t ipaddr[MAX_ADDRESSES];
    char ifname[IFNAMSIZ];
    uint8_t count;
};
 
static inline struct ifindex_ip4 *get_local_ip4(__u32 key){
    struct ifindex_ip4 *ifip4;
    ifip4 = bpf_map_lookup_elem(&ifindex_ip_map, &key);
	return ifip4;
}
 
/*look up attached interface IP address*/
struct ifindex_ip4 *local_ip4 = get_local_ip4(skb->ingress_ifindex);

/* if ip of attached interface found in map only allow ssh to that IP */
if(tcp && (bpf_ntohs(tuple->ipv4.dport) == 22)){
        if((!local_ip4 || !local_ip4->count)){
            return TC_ACT_OK;
        }else{
            uint8_t addresses = 0; 
            if(local_ip4->count < MAX_ADDRESSES){
                addresses = local_ip4->count;
            }else{
                addresses = MAX_ADDRESSES;
            }
            for(int x = 0; x < addresses; x++){
                if((tuple->ipv4.daddr == local_ip4->ipaddr[x]) && !local_diag->ssh_disable){
                    if(local_diag->verbose && ((event.tstamp % 2) == 0)){
                        event.proto = IPPROTO_TCP;
                        send_event(&event);
                    }
                    return TC_ACT_OK;
                }
            }
        }
  }
```

UDP follows the same basic premise, but I needed to make an exception specifically for DHCP since it operates in a way that makes state inspection difficult (other stateful FWs like UFW also make the same inbound exception)

```javascript
/* forward DHCP messages to local system */
    if(udp && (bpf_ntohs(tuple->ipv4.sport) == 67) && (bpf_ntohs(tuple->ipv4.dport) == 68)){
       return TC_ACT_OK;
}
```

## eBPF User Space Integration

I created a user space app zfw.c which updates the pinned maps described earlier. The zfw populates the ip address / name of the interface with the attached eBPF program and inserts/deletes rules into/ffrom the nf\_tproxy\_map with the usage following patterns:

```javascript
Usage: sudo zfw -I -c <ip dest address or prefix> -m <dst prefix len> -o <ip src address or prefix> -n <src prefix len>  -p tcp -l <dst low port> -h <dst high port> -t <tproxy port> -p <ip protocol>

 sudo zfw -I -c 172.16.240.1 -m 32 -o 10.1.1.1 -n 32  -p tcp -l 22 -h 22 -t 0
 
Usage: sudo zfw -D -c <ip dest address or prefix> -m <dst prefix len> -o <ip src address or prefix> -n <src prefix len>  -p tcp -l <dst low port> -h <dst high port> -t <tproxy port> -p <ip protocol>
 
 sudo zfw -D -c 172.16.240.1 -m 32 -o 10.1.1.1 -n 32  -p tcp -l 22
```

If you run an OpenZiti Router in diverter mode it will dynamically update the pinned BPF zt\_tproxy\_map used by the IFW to make forwarding decisions. The system calls are made dynamically whenever changes are made to any service either to add or delete them when running an OpenZiti edge-router in diverter mode.

The following shows the logging output from the edge-router running in diverter mode when initially learning services from the Ziti controller. You can see that it makes system calls to the zfw user space program to add the learned services as hash map entries into the bpf map.

```javascript
Feb 24 20:21:32 ebpf-router ziti-router[30284]: {"command":"/opt/openziti/bin/zfw -I -c 100.72.0.4 -m 32 -p tcp -l 5985 -h 5985 -t 43321","file":"/home/ziggy/gitnfnew/ziti/tunnel/intercept/tproxy/tproxy_linux.go:546","func":"github.com/openziti/ziti/tunnel/intercept/tproxy.(*tProxy).addInterceptAddr","level":"info","msg":"diverter command succeeded. output: Adding TCP mapping\n","time":"2024-02-24T20:21:32.420Z"}
Feb 24 20:21:32 ebpf-router ziti-router[30284]: {"command":"/opt/openziti/bin/zfw -I -c 100.72.0.4 -m 32 -p tcp -l 22 -h 22 -t 43321","file":"/home/ziggy/gitnfnew/ziti/tunnel/intercept/tproxy/tproxy_linux.go:546","func":"github.com/openziti/ziti/tunnel/intercept/tproxy.(*tProxy).addInterceptAddr","level":"info","msg":"diverter command succeeded. output: Adding TCP mapping\nlookup success\n","time":"2024-02-24T20:21:32.426Z"}
```

## TC-eBPF IFW – process and packet flow diagrams

![TC-eBPF IFW – process diagram](/blogs/openziti/v1668007360611/6LzUjyxVe.jpg)

![TC-eBPF IFW – packet flow diagram](/blogs/openziti/v1668007368128/DlMW3rsU9.jpg)

## Summary

This article described how I leveraged eBPF-TC to build a Plugin TPROXY IFW to steer traffic to my target application. Hopefully you found the experience that I shared useful. Would love to hear how other eBPF developers are making use of this robust functionality.
