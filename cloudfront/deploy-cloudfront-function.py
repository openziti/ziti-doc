
import os
import boto3
# from botocore.exceptions import ClientError
import json
import string
import random
import logging

logging.basicConfig(level=logging.INFO)

client = boto3.client('cloudfront')

docs_function_etag = None
docs_function_name = 'docs-viewer-request-function'
docs_function_file = 'cloudfront/cloudfront-function-docs-openziti-io.js'
docs_function_bytes = open(docs_function_file, 'rb').read()

# find the dev function etag to update
describe_dev_function = client.describe_function(
    Name=docs_function_name,
    Stage='DEVELOPMENT'
)
logging.debug(f"got dev function etag: {describe_dev_function['ETag']}")

# update the dev function and capture the new etag as a candidate for promotion
update_response = client.update_function(
    Name=docs_function_name,
    IfMatch=describe_dev_function['ETag'],
    FunctionConfig={
        'Comment': f"Repo 'openziti/zti-doc' GitHub SHA: {os.environ['GITHUB_SHA']}",
        'Runtime': 'cloudfront-js-1.0'
    },
    FunctionCode=docs_function_bytes
)
candidate_function_etag = update_response['ETag']
logging.debug(f"got candidate etag: {candidate_function_etag}")
# verify the root path is handled correctly by the candidate function
test_root_response = client.test_function(
    Name=docs_function_name,
    IfMatch=candidate_function_etag,
    Stage='DEVELOPMENT',
    EventObject=b'''
        {                            
            "version": "1.0",
            "context": {    
                "eventType": "viewer-request"
            },
            "viewer": {
                "ip": "1.2.3.4"
            },
            "request": {
            "method": "GET",                                                             
            "uri": "/",
            "headers": {
                "host": {"value": "docs.openziti.io"}
            },
            "cookies": {},              
            "querystring": {}                                                            
            }                        
        }
    '''
)
# print(json.dumps(test_root_response, indent=4, sort_keys=True, default=str))
test_root_result = json.loads(test_root_response['TestResult']['FunctionOutput'])
# print(json.dumps(test_result_docs, indent=4, sort_keys=True, default=str))
test_root_result_location = test_root_result['response']['headers']['location']['value']
logging.debug(f"got test root result location: {test_root_result_location}")
if test_root_result_location == 'https://openziti.io/docs':
    logging.debug(f"Test '/' root path passed")
else:
    logging.error(f"Test '/' root path failed, got unexpected location {test_root_result_location}")
    exit(1)

# verify a random /path is handled correctly by the candidate function
random_path = ''.join(random.choices(string.ascii_uppercase+string.digits, k=4))
random_test_obj = {
    "version": "1.0",
    "context": {    
        "eventType": "viewer-request"
    },
    "viewer": {
        "ip": "1.2.3.4"
    },
    "request": {
    "method": "GET",                                                             
    "uri": f"/{random_path}",
    "headers": {
        "host": {"value": "docs.openziti.io"}
    },
    "cookies": {},              
    "querystring": {}                                                            
    }                        
}
test_random_response = client.test_function(
    Name=docs_function_name,
    IfMatch=candidate_function_etag,
    Stage='DEVELOPMENT',
    EventObject=bytes(json.dumps(random_test_obj), 'utf-8')
)
test_random_result = json.loads(test_random_response['TestResult']['FunctionOutput'])
test_random_result_location = test_random_result['response']['headers']['location']['value']
logging.debug(f"got test random result location: {test_random_result_location}")
if test_random_result_location == f'https://openziti.io/{random_path}':
    logging.debug(f"Test random path '/{random_path}' passed")
else:
    logging.error(f"Test random path '/{random_path}' failed, got unexpected location {test_random_result_location}")
    exit(1)

# promote candidate from DEVELOPMENT to LIVE
publish_response = client.publish_function(
    Name=docs_function_name,
    IfMatch=candidate_function_etag
)
logging.info(f"published function: {publish_response['FunctionSummary']['Name']}")

#
# scratch
#

# distributions = client.list_distributions()
# docs_distribution_id = None
# for distribution in distributions['DistributionList']['Items']:
#     if distribution['Aliases']['Items'][0] == 'docs.openziti.io':
#         docs_distribution_id = distribution['Id']
#         print(f"Found docs distribution id: {docs_distribution_id}")
