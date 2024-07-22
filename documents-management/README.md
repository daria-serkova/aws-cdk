# AWS Serverless Document Management Solution for Healthcare Providers

This repository contains an AWS serverless solution for managing healthcare provider onboarding documents. The solution is designed to be generic and reusable for other document management applications beyond healthcare. It leverages various AWS services to provide a scalable, secure, and cost-effective document management system.

## Features

1. **User Authentication and Authorization:** Uses Amazon Cognito for managing user sign-up, sign-in, and roles.
2. **API Management:** Uses Amazon API Gateway to expose RESTful APIs for document upload, retrieval, and management.
3. **Document Storage:** Stores documents in Amazon S3 with a structured folder hierarchy.
4. **Metadata Storage:** Stores document metadata in Amazon DynamoDB, including status (submitted, verified, rejected).
5. **Document Encryption:** Uses AWS KMS to encrypt documents and metadata for enhanced security.
6. **Workflow Orchestration:** Uses AWS Step Functions to manage complex workflows, such as document verification processes.
7. **Notifications:** Uses Amazon SNS to send notifications regarding document statuses.
8. **Infrastructure as Code:** Uses AWS CloudFormation and AWS CDK for infrastructure deployment and management.
9. **Scalability and Flexibility:** Designed to be easily scalable and adaptable for various document management use cases.

## Key Aspects

- All stack resources have set of required tags attached 
- All stack resources send logs into specified CloudWatch group