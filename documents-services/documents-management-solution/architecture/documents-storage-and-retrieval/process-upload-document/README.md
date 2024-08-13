# Process: Upload Document

The Upload Document process is a critical component of Document Management Solution designed to facilitate the secure and efficient uploading of documents (from supported list) by users. 

## Components View

![Components View](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-upload-document/process-diagram.svg)

## API Details

This endpoint should be used when a user needs to upload a single document or multiple documents into the system. This method will generate list of S3 pre-signed URLs, where UI application can upload documents via direct PUT API request to S3.

- **API endpoint:** {{API_GATEWAY_URL}}/v1/document/upload
- **API supported methods:** POST
- **API authorization:** Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![Validation Rules](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-upload-document/api-validation-rules.svg)

If at least one validation rule failed, API will return `400 (Bad Request)` status code:

```
{
    "message": "Invalid request body"
}
```

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
            "uploadUrl": "https://TBD.s3.us-east-1.amazonaws.com/insurance/uploaded/DOC_OWNER_ID_1/pre-auth-requests/PRE-AUTH-REQUEST.PDF?{{generateddata}}",
            "documentId": "insurance/uploaded/DOC_OWNER_ID_1/pre-auth-requests/PRE-AUTH-REQUEST.PDF"
        }
    ]
}
```

UI application will need to iterate through list of generated URLs to upload binary files to AWS service.

