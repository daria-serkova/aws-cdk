# Document Storage and Retrieval

In any document management system, ensuring secure and scalable storage is critical for handling a wide variety of documents such as contracts, invoices, claims, HR files, and more. This aspect encompasses not only the physical storage of files but also the efficient organization and retrieval of those documents to support business operations.

## Technology Stack

The Document Storage and Retrieval processes in the system leverage following technology stack to ensure security, scalability, and efficiency:

1. **IAM (Identity and Access Management):** Manages secure access to the system's resources, ensuring that only authorized users can interact with document storage and retrieval processes.
2. **AWS Cognito:** Manages user authentication and authorization, providing secure access to the system by ensuring that only verified users can interact with document storage and retrieval processes.
3. **API Gateway:** Serves as the front door for all API requests, routing them to the appropriate backend services while providing features like request validation, rate limiting, and authorization.
4. **Step Functions:** Orchestrates complex, multi-step workflows, including document upload, retrieval, audit logging, and notification steps. This ensures that each step in the process is executed in sequence and according to predefined logic.
5. **Lambdas:** Handles simple, stateless flows within the document management process, such as generating pre-signed URLs or processing document metadata, ensuring rapid and efficient execution of specific tasks.
6. **S3:** Provides scalable and durable storage for documents, enabling secure upload, retrieval, and management of document files.
7. **DynamoDB:** Serves as the primary database for storing and querying document metadata, supporting fast and reliable access to document information based on various criteria.
8. **CloudWatch:** Monitors and logs the entire document storage and retrieval process, offering real-time insights, alerts, and detailed errors trails for troubleshooting and performance optimization.
9. **KMS (Key Management Service):** Provides encryption at rest and in transit, ensuring that sensitive documents and metadata are securely encrypted using managed keys. This enhances the security and compliance of document storage and retrieval processes.

## Secure Storage

Documents often contain sensitive or confidential information that must be protected from unauthorized access. This requires implementing robust security measures, such as encryption both at rest and in transit, access control mechanisms, and regular security audits. Access to documents can be controlled through role-based permissions, ensuring that only authorized users can view or modify specific files. Following security aspects are implemented in the Documents Management Service:

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/security-view/security-elements.png)


## Scalable Storage

As organizations grow, so does the volume of documents they need to store. A scalable storage solution ensures that the system can handle increasing data without compromising performance. Cloud-based storage solutions, such as Amazon S3, provide virtually unlimited storage capacity, automatically scaling with the needs of the organization. Additionally, S3 offers features like automatic replication and data redundancy to ensure high availability and durability.

## Storage Structure

Following S3 storage structure will be created by service's upload workflow, based on the type and category of uploaded document:

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/organization-view/s3-structure.png)

## Documents Metadata

Metadata is data about data, which provides information about the document's contents, context, and attributes. By tagging documents with relevant metadata (e.g., document type, date created, author, status, expiration date etc.), organizations can create a structured and easily searchable document repository. Metadata tagging facilitates quick access to documents by enabling users to search and filter documents based on specific criteria. Metadata is stored inside DynamoDB table for fast and effective retrieval.

Sample of the metadata record:

```
{
 "documentid": "hr/verified/PROVIDER_COGNITO_ID_1/personal/SOCIAL_SECURITY_NUMBER.PDF",
 "documentcategory": "SOCIAL_SECURITY_NUMBER",
 "documentformat": "PDF",
 "documentname": "SOCIAL_SECURITY_NUMBER",
 "documentnumber": "123456789012",
 "documentownerid": "USER_ID_1",
 "documentsize": 334454,
 "documentstatus": "Verified",
 "expirydate": "7596421138000",
 "issuedate": "1596421138000",
 "issuedby": "Government of USA",
 "issuedto": "Joe Field",
 "uploadedat": "1722981251767",
 "uploadedby": "REQUESTOR_COGNITO_ID_1",
 "version": "dd9774hXD441S56X5ybJd4lLnEx6p0w9"
}
```


## API Layer

Service contains an API layer that provides essential functionalities for managing documents. This API layer allows users to:

1. **Upload Documents:** Users can securely upload documents to the system, ensuring that they are properly stored and accessible for future use. 
2. **Retrieve Document Information:** Users can access detailed information about specific documents, including content, metadata, status, and other relevant details.
3. **Retrieve a List of Documents based on certain criteria:** The API enables users to filter and retrieve lists of documents based on various criteria, such as document status, user ID, or other attributes, facilitating efficient document management and access.

### 1. Document Upload Workflow

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/upload-workflow.png)

#### API Request Format
Sample of the request to AWS service to generate S3 pre-signed urls per each document:

```
POST: {{API_GATEWAY_URL}}/document/upload

{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID_1",
    "files": [
        {
            "documentownerid": "DOC_OWNER_ID_1",
            "documentformat": "PDF",
            "documentsize": 1048576,
            "documentcategory": "INSURANCE_CLAIM"
        },
        {
            "documentownerid": "DOC_OWNER_ID_1",
            "documentformat": "PDF",
            "documentsize": 1048576,
            "documentcategory": "PRE-AUTH-REQUEST",
            "metadata": {
              "documentnumber": "123456789012",
              "issuedate": "1596421138000",
              "expirydate": "7596421138000",
              "issuedto": "Josh Field"
            }
        }
    ]
}

```
#### API Response Format
Sample of the response from AWS service with S3 pre-signed urls per each document:
```
{
    "message": "Presigned URLs generated successfully",
    "documentUploadUrls": [
        {
            "documentCategory": "INSURANCE_CLAIM",
            "uploadUrl": "https://TBD.s3.us-east-1.amazonaws.com/insurance/uploaded/DOC_OWNER_ID_1/claims/INSURANCE_CLAIM.PDF?{{generateddata}}",
            "documentId": "insurance/uploaded/DOC_OWNER_ID_1/claims/INSURANCE_CLAIM.PDF"
        },
        {
            "documentCategory": "PRE-AUTH-REQUEST",
            "uploadUrl": "https://TBD.s3.us-east-1.amazonaws.com/insurance/uploaded/DOC_OWNER_ID_1/pre-auth-requests/PRE-AUTH-REQUEST.PDF?{{generateddata}}",
            "documentId": "insurance/uploaded/DOC_OWNER_ID_1/pre-auth-requests/PRE-AUTH-REQUEST.PDF"
        }
    ]
}
```

UI application will need to iterate through list of generated URLs to upload binary files to AWS service.

### 2. Get Document Details Workflow

API and corresponding flow is utilized on screens where users need to view detailed information about documents, including sensitive data such as PII, PHI, and PCI from the metadata, as well as a preview of the document itself. For instance, this can be particularly useful for the Verification Team, where both metadata and document content are displayed side by side.

This request is subject to auditing due to the potential exposure of sensitive information from both the document and its metadata (View Metadata and View Content events).

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/get-document-details.png)

**NOTES:** 

1. Generated Pre-Signed URL will expire after 5 mins. For immediate access scenarios (e.g., viewing a document right after it's requested), an expiration time of 5 to 15 minutes is usually recommended. This helps minimize the risk of the URL being misused if intercepted.
2. API endpoint should be used for immediate access only (for example display document content side by side with metadata). This API endpoint is not intended to be used for buttons on the page which opens files upon click, since if user clicked on the button after expiration time, error will be displayed. /get-url endpoint should be used instead for scenarios, where user view document after clicking the button.

#### API Request Format

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "requestorip": "192.168.1.1",
    "documenttype": "insurance",
    "documentid": "insurance/verified/PROVIDER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF"
}

```
#### API Response Format

```
{
    "statusCode": 200,
    "body": {
        "version": "dd9774hXD441S56X5ybJd4lLnEx6p0w9",
        "documentstatus": "Verified",
        "expirydate": "7596421138000",
        "documentid": "insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF",
        "documentownerid": "USER_COGNITO_ID_1",
        "documentformat": "PDF",
        "issuedate": "1596421138000",
        "uploadedby": "REQUESTOR_COGNITO_ID_1",
        "documentname": "CLAIM_2024_12_31_12345667788",
        "documentcategory": "CLAIMS",
        "uploadedat": "1722981251767",
        "documentsize": 334454,
        "documentnumber": "123456789012",
        "initiatorsystemcode": "ABC_WEB_APP",
        "requestorid": "REQUESTOR_COGNITO_ID",
        "requestorip": "192.168.1.1",
        "documenttype": "insurance",
        "actions": [
            "View Metadata",
            "View Content"
        ],
        "url": "https://TBD.s3.us-east-1.amazonaws.com/insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF?{{generateddata}}",
        "urlexpiresat": 1723477931026
    }
}
```

### 3. Get Document URL (Content) Workflow

API and corresponding workflow is used on screens where users want to view the content of a document. For example, it is useful on the List of Documents screen, where the 'View Document' button allows the document to be opened in a separate tab.

This request is audited due to the potential exposure of sensitive information contained within the document (View Content event).

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/get-document-url.png)

#### API Request Format

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "requestorip": "192.168.1.1",
    "documenttype": "insurance",
    "documentid": "insurance/uploaded/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF"
}
```

#### API Response Format

```
{
    "statusCode": 200,
    "body": {
        "initiatorsystemcode": "ABC_WEB_APP",
        "requestorid": "REQUESTOR_COGNITO_ID",
        "requestorip": "192.168.1.1",
        "documenttype": "insurance",
        "documentid": "insurance/uploaded/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF",
        "url": "https://TBD.s3.us-east-1.amazonaws.com/insurance/uploaded/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF?{{generateddata}}",
        "urlexpiresat": 1723490514509,
        "actions": [
            "View Content"
        ],
        "version": "dd9774hXD441S56X5ybJd4lLnEx6p0w9"
    }
}

```

### 4. Get Document Metadata Workflow

API and corresponding workflow is used on screens where users need to view detailed information about a document, excluding its content.

This request is audited due to the potential exposure of sensitive information contained in the metadata (View Metadata event).

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/get-document-metadata.png)

#### API Request Format

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "requestorip": "192.168.1.1",
    "documenttype": "insurance",
    "documentid": "insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF"
}
```
#### API Response Format

```
{
    "statusCode": 200,
    "body": {
        "version": "dd9774hXD441S56X5ybJd4lLnEx6p0w9",
        "documentstatus": "Verified",
        "expirydate": "7596421138000",
        "documentid": "insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF",
        "documentownerid": "USER_COGNITO_ID_1",
        "documentformat": "PDF",
        "issuedto": "Joe Field",
        "issuedate": "1596421138000",
        "uploadedby": "REQUESTOR_COGNITO_ID_1",
        "documentname": "CLAIM_2024_12_31_12345667788",
        "documentcategory": "INSURANCE_CLAIM",
        "uploadedat": "1722981251767",
        "documentsize": 334454,
        "documentnumber": "123456789012",
        "initiatorsystemcode": "ABC_WEB_APP",
        "requestorid": "REQUESTOR_COGNITO_ID",
        "requestorip": "192.168.1.1",
        "documenttype": "insurance",
        "actions": [
            "View Metadata"
        ]
    }
}
```

### 5. Get Documents List (By Status)

API and corresponding workflow is used on screens where end-users need to view a list of documents filtered by a specified status. For example, it is particularly useful on the Verification Team's screens to:

1. Display all users' documents with a Pending Review status.
2. Display all insurance documents with a Rejected status for a specified user ID (document Owner ID).

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/get-documents-list-by-status.png)


**NOTE:** API endpoint retrieves only non-sensitive information. For example it will not return IssueTo field or any other PII, PHI, PCI information, that was provided in metadata, during upload process. This is done because returned list can be large and auditing of View List api call can affect application performance (since audit event will have to be created for each document from the list). Recommended to go in the document details page to see it’s PII, PHI, PCI metadata information and view link (Get Document Details is audited action). If displaying sensitive information in the list is needed, this should be implemented separately with all performance considerations in place. This service does not have code for such scenarios.

#### API Request Format

Across all document owners:
```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "documenttype": "insurance",
    "documentstatus": "Verified",
    "documentownerid": "*"
}
```

For specified document owner:

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "documenttype": "insurance",
    "documentstatus": "Verified",
    "documentownerid": "USER_COGNITO_ID"
}
```

#### API Response Format

```
[
    {
        "documentcategory": "INSURANCE_CLAIM",
        "documentownerid": "PROVIDER_COGNITO_ID_1",
        "documentstatus": "Verified",
        "documentid": "insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF",
        "expirydate": "7596421138000"
    }
]
```

### 6. Get Documents List (By Owner)

API and corresponding workflow is used on screens where end-users need to view a list of documents based on the user ID to whom the documents belong. For example, it is useful for:

1. Users to see all submitted documents and their current status on their profile screen.
2. The billing team to view a list of payment statements associated with a specific user ID

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/workflows/get-documents-list-by-owner.png)

**NOTE:** API endpoint retrieves only non-sensitive information. For example it will not return IssueTo field or any other PII, PHI, PCI information, that was provided in metadata, during upload process. This is done because returned list can be large and auditing of View List api call can affect application performance (since audit event will have to be created for each document from the list). Recommended to go in the document details page to see it’s PII, PHI, PCI metadata information and view link (Get Document Details is audited action). If displaying sensitive information in the list is needed, this should be implemented separately with all performance considerations in place. This service does not have code for such scenarios.

#### API Request Format

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "documenttype": "insurance",
    "documentownerid": "USER_COGNITO_ID_1"
}

```

#### API Response Format

```
[
    {
        "documentcategory": "INSURANCE_CLAIM",
        "documentownerid": "USER_COGNITO_ID_1",
        "documentstatus": "Verified",
        "documentid": "insurance/verified/USER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF",
        "expirydate": "7596421138000"
    }
]
