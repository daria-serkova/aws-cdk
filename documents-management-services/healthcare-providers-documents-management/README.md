# AWS Serverless Document Management Solution for Healthcare Providers

This repository contains an AWS serverless solution for managing healthcare provider onboarding documents. The solution is designed to be generic and reusable for other document management applications beyond healthcare. It leverages various AWS services to provide a scalable, secure, and cost-effective document management system.

## Implemented Scenarios

1. [Scenario 1: Healthcare Provider Uploads Credential Documents](https://github.com/daria-serkova/aws-cdk/tree/main/documents-management-services/healthcare-providers-documents-management/scenarios/upload-credential-documents)

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

## Technology Stack

- **AWS CloudFormation / AWS CDK:** Infrastructure as Code (IaC) for deploying the solution.
- **TypeScript:** Programming language.
- **S3:** Documents storage.
- **Lambda:** Process document uploads and handle verification.
- **API Gateway:** Expose APIs for document upload and retrieval.
- **DynamoDB:** Store metadata about the documents, including verification status.
- **CloudWatch:** Logs management.
- **AWS KMS (Key Management Service):** Encrypt documents and metadata.
- **Amazon SNS (Simple Notification Service):** Send notifications.
- **AWS IAM:** Manage permissions and roles.
- **Amazon Cognito:** Manage user authentication and authorization.


## Key Aspects

- All stack resources have set of required tags attached.
- All stack resources send logs into specified CloudWatch group.
- All architecture diagrams (PlantUML and Draw.io formats) are located inside `architecture` folder. Install corresponding extensions to see them inside VSC.
- All API endpoints are located inside `postman-collection` folder. Import environment and collection from it into local Postman for testing purposes.
- Since as per requirements, each API request must be tracked in the audit framework, all API requests (including data retrieval) are sent as POST methods with required audit details included inside request body object. 