# Document Storage and Retrieval

In any document management system, ensuring secure and scalable storage is critical for handling a wide variety of documents such as contracts, invoices, claims, HR files, and more. This aspect encompasses not only the physical storage of files but also the efficient organization and retrieval of those documents to support business operations.


## Secure and Scalable Storage

**Security**: Documents often contain sensitive or confidential information that must be protected from unauthorized access. This requires implementing robust security measures, such as encryption both at rest and in transit, access control mechanisms, and regular security audits. Access to documents can be controlled through role-based permissions, ensuring that only authorized users can view or modify specific files.

**Scalability**: As organizations grow, so does the volume of documents they need to store. A scalable storage solution ensures that the system can handle increasing data without compromising performance. Cloud-based storage solutions, such as Amazon S3 or Azure Blob Storage, provide virtually unlimited storage capacity, automatically scaling with the needs of the organization. Additionally, these platforms offer features like automatic replication and data redundancy to ensure high availability and durability.

## Metadata Tagging for Efficient Organization and Retrieval

Metadata is data about data, which provides information about the document's contents, context, and attributes. By tagging documents with relevant metadata (e.g., document type, date created, author, status, expiration date etc.), organizations can create a structured and easily searchable document repository. Metadata tagging facilitates quick access to documents by enabling users to search and filter documents based on specific criteria.

# Implementation

## 1. Document Upload Workflow

![PlantUML Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/upload-workflow.png)

### API Request Format
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
### API Response Format
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
            "uploadUrl": "https://TBD.s3.us-east-1.amazonaws.com/insurance/uploaded/DOC_OWNER_ID_1/pre-auth-requests/PRE-AUTH-REQUEST.PDF?{{generateddata}}"
        }
    ]
}
```