---
id: router-sizing
title: Sizing
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import styles from './styles.module.css';

<Tabs>
<TabItem value="vcpe" label="vCPE (generic type)" attributes={{className: styles.custom}}>

:::info Notes
- Reference CPU - Intel(R) Xeon(R) CPU E5-2680 v3 @ 2.50GHz
- NetFoundry recommends a 1:1 physical to logical association for network interfaces.
:::

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | VM specification | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | CPU Cores: 4 | Single LAN/WAN interface |
| 100-200 Mbps Throughput  | Memory RAM: 4 GBytes | 1 LAN + 1 WAN interfaces |
| | Disk Storage: 30 GByte | 1 LAN + 2 WAN interfaces |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | VM specification | Supported interface configurations * |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | CPU Cores: 8 | 1 LAN + 1 WAN interfaces |
| 500 Mbps Throughput  | Memory RAM: 6 GBytes | 1 LAN + 2 WAN interfaces |
| | Disk Storage: 50 GByte | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | VM specification | Supported interface configurations * |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | CPU Cores: 10 | 1 LAN + 1 WAN interfaces |
| 500+ Mbps Throughput  | Memory RAM: 8 GBytes | 1 LAN + 2 WAN interfaces|
| | Disk Storage: 100 GByte | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="aws" label="AWS Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | c5.large | Single LAN/WAN interface |
| 100-300 Mbps Throughput | | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | c5.xlarge | Single LAN/WAN interface |
| 500 Mbps Throughput | | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | c5.2xlarge | Single LAN/WAN interface |
| 500+ Mbps Throughput  | | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="azure" label="Azure Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | Standard_F2s_v2 | Single LAN/WAN interface |
| 100-300 Mbps Throughput | | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | Standard_F4s_v2 | Single LAN/WAN interface |
| 500 Mbps Throughput | | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | Standard_F8s_v2 | Single LAN/WAN interface |
| 500+ Mbps Throughput  | | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="oracle" label="Oracle Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | VM.Standard.E3.Flex| Single LAN/WAN interface |
| 100-300 Mbps Throughput | 1 Core OCPU / 4 GB Memory | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | VM.Standard.E3.Flex | Single LAN/WAN interface |
| 500 Mbps Throughput | 2 Core OCPU / 8 GB Memory | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | VM.Standard.E3.Flex | Single LAN/WAN interface |
| 500+ Mbps Throughput  | 8 Core OCPU / 64 GB Memory | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="ali" label="Ali Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | ecs.c6e.large  | Single LAN/WAN interface |
| 100-300 Mbps Throughput | ecs.sn1ne.large | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | ecs.c6e.xlarge | Single LAN/WAN interface |
| 500 Mbps Throughput | ecs.sn1ne.xlarge | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | ecs.c6e.2xlarge | Single LAN/WAN interface |
| 500+ Mbps Throughput  | ecs.sn1ne.2xlarge | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="gcp" label="GCP Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | e2-standard-2 | Single LAN/WAN interface |
| 100-300 Mbps Throughput | | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | e2-standard-4 | Single LAN/WAN interface |
| 500 Mbps Throughput | | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | e2-standard-8 | Single LAN/WAN interface |
| 500+ Mbps Throughput  | | |

</TabItem>
</Tabs>

</TabItem>
<TabItem value="ibm" label="IBM Cloud" attributes={{className: styles.custom}}>

<Tabs>
<TabItem value="low-med" label="LOW-MED" attributes={{className: styles.green}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 100 Simultaneous Data Sessions | cx2-2x4 | Single LAN/WAN interface |
| 100-300 Mbps Throughput | | |

</TabItem>
<TabItem value="med" label="MED" attributes={{className: styles.orange}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 500 Simultaneous Data Sessions | cx2-4x8 | Single LAN/WAN interface |
| 500 Mbps Throughput | | |

</TabItem>
<TabItem value="high" label="HIGH" attributes={{className: styles.red}}>

| Target performance | Instance Name | Supported interface configurations |
| :---: | :---: | :---: |
| 1000+ Simultaneous Data Sessions | cx2-8x16 | Single LAN/WAN interface |
| 500+ Mbps Throughput  | | |

</TabItem>
</Tabs>

</TabItem>
</Tabs>