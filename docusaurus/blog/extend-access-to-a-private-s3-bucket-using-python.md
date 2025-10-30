---
title: "Extend Access to a Private S3 Bucket Using Python"
date: 2024-07-23T17:05:14Z
cuid: clyyo2bjs000909kybcio718z
slug: extend-access-to-a-private-s3-bucket-using-python
authors: [KennethBingham]
image: "@site/blogs/openziti/v1721753949507/7351140d-d4d4-4531-b56d-c2bfa9f4bb17.png"
imageDark: "@site/blogs/openziti/v1721753949507/7351140d-d4d4-4531-b56d-c2bfa9f4bb17.png"
ogimage: /blogs/openziti/v1721754283206/4a5bea22-a608-4c1d-b323-47b9067cbd1e.png
tags: 
  - python
  - boto3

---

A private S3 bucket protects against a data leak by denying all public access. This approach moves access control from the public S3 API to the network layer. We can use OpenZiti's cryptographic identity and attribute-based policies to securely extend access to a trusted Python program at a remote site.

![](/blogs/openziti/v1721754674859/9428a427-5a2f-41f0-ac30-af0c83a09c69.png)

<!-- truncate -->

The OpenZiti Python SDK (`import openziti`) makes it easy to use the AWS Python SDK (`import boto3`) through an OpenZiti tunnel using only Python. No sidecar, agent, or client proxy is needed!

Here's an example of a bucket policy that allows any S3 bucket action for any AWS caller identity as long as the request arrives via the VPC endpoint (VPCE).

```json
{
   "Version": "2012-10-17",
   "Id": "Policy1415115909152",
   "Statement": [
     {
       "Sid": "Access-to-specific-VPCE-only",
       "Principal": "*",
       "Action": "s3:*",
       "Effect": "Deny",
       "Resource": ["arn:aws:s3:::awsexamplebucket1",
                    "arn:aws:s3:::awsexamplebucket1/*"],
       "Condition": {
         "StringNotEquals": {
           "aws:SourceVpce": "vpce-1a2b3c4d"
         }
       }
     }
   ]
}
```

*from* [*Restricting access to a specific VPC endpoint*](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html#example-bucket-policies-restrict-accesss-vpc-endpoint)

Consider this Python script that uploads a file to a private S3 bucket. This must run inside the trusted VPC to reach the private IP address of the VPCE (i.e., Privatelink Interface).

```python
from boto3 import client

s3 = client(service_name='s3', endpoint_url=bucket_endpoint)

s3.upload_file(file_path, bucket_name, file_name)
```

We can extend trust beyond the VPC to securely perform bucket actions from anywhere. This next example patches the S3 client to tunnel to the bucket endpoint with OpenZiti securely.

```python
from boto3 import client

import openziti

s3 = client(service_name='s3', endpoint_url=bucket_endpoint)

openziti.load(ziti_identity_file)

with openziti.monkeypatch():
    s3.upload_file(file_path, bucket_name, file_name)
```

These Python snippets are representative of a functioning sample, `s3z.py` ([link to OpenZiti Python SDK](https://github.com/openziti/ziti-sdk-py/tree/main/sample/s3z#readme)). The README contains a list of the AWS and OpenZiti entities and configurations that make this possible.

## Share the Project

![](/blogs/openziti/v1702330572628/7bb2b76c-af3f-45c6-83ab-d519f183024d.png?auto=compress,format&format=webp)

If you find this interesting, please consider [**starring us on GitHub**](https://github.com/openziti/ziti/). It helps. Let us know if you found a good use for this or have an improvement or question in mind on [**X <s>twitter</s>**](https://twitter.com/openziti), in [/r/openziti](https://www.reddit.com/r/openziti/), or the [Discourse forum](https://openziti.discourse.group/). We upload and stream [**on YouTube**](https://youtube.com/openziti) too. We'd love to hear from you!
