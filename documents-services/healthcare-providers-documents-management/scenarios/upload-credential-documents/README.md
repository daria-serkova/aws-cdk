# Healthcare Provider Uploads Credential Documents

## Background
Dr. Emily Johnson, a newly credentialed orthopedic surgeon, has recently joined a large medical practice group. As part of the onboarding process, she needs to submit various credentialing documents to the practice’s central credentialing system. This ensures that her qualifications, licenses, and certifications are verified and compliant with both internal and regulatory standards.

Dr. Johnson clicks the “Upload Documents” button inside organization's portal, which opens a secure file upload interface. The system prompts her to upload several documents, including:

1. Medical License
2. Board Certification
3. DEA Registration
4. Curriculum Vitae (CV)
5. Malpractice Insurance

She selects each file from her local computer. 

After selecting the documents, Dr. Johnson is prompted to enter metadata for each document, such as:

1. Document Type (e.g., License, Certification)
2. Expiration Date (if applicable)
3. Issuing Date
4. Issuing Authority

This metadata helps the credentialing team categorize and verify the documents more efficiently.

## Workflow

1. Upon successful submission system validates each document for correct format, size, document category, integrity to ensure compatibility with the system.
2. Upon successful validation system saves document in the S3 bucket and document's metadata inside DynamoDB table.
3. Upon successful storage, Dr. Johnson receives a confirmation message and a unique submission reference number. This reference number allows her to track the status of her documents within the portal.
4. Also system sends an automated email confirmation to Dr. Johnson, acknowledging receipt of the documents and providing an estimated timeline for review. 
5. Document submission event is stored inside Audit DynamoDB table 

## Technology Stack

- **AWS CloudFormation / AWS CDK:** Infrastructure as Code (IaC) for deploying the solution.
- **TypeScript:** Programming language.
- **S3:** Documents storage.
- **Step Function:**: Workflow orchestration.
- **Lambda:** Process document validation, upload, email sending.
- **API Gateway:** Expose APIs for document upload and retrieval.
- **DynamoDB:** Store metadata about the documents, including verification status.
- **CloudWatch:** Logs management.
- **AWS IAM:** Manage permissions and roles.