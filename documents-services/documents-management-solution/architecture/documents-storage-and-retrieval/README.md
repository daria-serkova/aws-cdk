# Document Storage and Retrieval

In any document management system, ensuring secure and scalable storage is critical for handling a wide variety of documents such as contracts, invoices, claims, HR files, and more. This aspect encompasses not only the physical storage of files but also the efficient organization and retrieval of those documents to support business operations.

## Supported Processes

![Supported Processes Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/supported-processes.svg)

1. [Upload Documents Process](https://github.com/daria-serkova/aws-cdk/tree/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-upload-document)
2. [Retrieve Full Document](https://github.com/daria-serkova/aws-cdk/tree/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-retrieve-full-document)

## Storage Considerations

### Security

Documents often contain sensitive or confidential information that must be protected from unauthorized access. This requires implementing robust security measures, such as encryption both at rest and in transit, access control mechanisms, and regular security audits. Access to documents can be controlled through role-based permissions, ensuring that only authorized users can view or modify specific files. Following security aspects are implemented in the Documents Management Service:

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/security-view/security-elements.png)

### Scalability

As organizations grow, so does the volume of documents they need to store and manage. A scalable storage solution ensures that the system can handle increasing data without compromising performance. Cloud-based storage solutions, such as Amazon S3, provide virtually unlimited storage capacity, automatically scaling with the needs of the organization. Additionally, S3 offers features like automatic replication and data redundancy to ensure high availability and durability. Key aspects include:

1. **Elastic Storage:** Amazon S3 scales automatically to accommodate growing data volumes.
2. **High Availability:** S3 provides a Service Level Agreement (SLA) of 99.99% availability.
3. **Durability:** S3 guarantees 99.999999999% (11 nines) durability, ensuring that documents are reliably stored and protected.

Following additional scalability aspects are implemented in the Documents Management Service:

**TBD**


### Cost 

Managing costs is essential in any storage solution. Cloud storage solutions like Amazon S3 offer various pricing tiers and options to help manage expenses effectively:

1. **Cost-Effective Storage:** Use of different storage classes (e.g., S3 Standard, S3 Intelligent-Tiering, S3 Glacier) based on access patterns to optimize costs.
2. **Lifecycle Policies:** Automated archiving and deletion policies to manage long-term storage costs.
3. **Monitoring and Alerts:** Implementation of CloudWatch to monitor usage and costs, with alerts set up to inform about potential overspending.

Following cost managment configuration is done in the Documents Management Service and needs to be tuned for each project separately:

**TBD**

## Storage Architecture

### Supported Documents

Documents Managment Solution contains configuration, that allows to restrict list of supported documents' types, categories, formats and maximum size of the documents, that can be uploaded to the system through its API Layer. Configuration is done via aws-cdk/documents-services/documents-management-solution/functions/helpers/utilities.ts file and can be tuned for specific project's use cases with minimum effort. API Layer will validate each request for match with these values before route it for processing. 

Sample of supported files configuration (based on Healthcare Platform use case):

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/organization-view/supported-documents.png)

### S3 Bucket Structure

Following S3 storage structure will be created by service's upload workflow, based on the type and category of uploaded document:

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/organization-view/s3-structure.png)

### S3 Bucket Object Metadata

**TBD**
### DynamoDB Metadata Tables Structure

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
