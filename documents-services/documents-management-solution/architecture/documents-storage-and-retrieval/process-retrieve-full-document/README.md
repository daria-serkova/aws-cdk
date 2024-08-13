# Process: Retrieve Full Document

API and corresponding process is utilized on screens where users need to view detailed information about documents, including sensitive data such as PII, PHI, and PCI from the metadata, as well as a preview of the document itself. For instance, this can be particularly useful for the Verification Team, where both metadata and document content are displayed side by side.

This request is subject to auditing due to the potential exposure of sensitive information from both the document and its metadata (View Metadata and View Content events).

**NOTES:** 

1. Generated Pre-Signed URL will expire after 5 mins. For immediate access scenarios (e.g., viewing a document right after it's requested), an expiration time of 5 to 15 minutes is usually recommended. This helps minimize the risk of the URL being misused if intercepted.
2. API endpoint should be used for immediate access only (for example display document content side by side with metadata). This API endpoint is not intended to be used for buttons on the page which opens files upon click, since if user clicked on the button after expiration time, error will be displayed. /get-url endpoint should be used instead for scenarios, where user view document after clicking the button.


## Components View

![Components View](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-retrieve-full-document/process-diagram.svg)

## API Details

- **API endpoint:** {{API_GATEWAY_URL}}/v1/document/upload
- **API supported methods:** POST
- **API authorization:** Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![Validation Rules](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-storage-and-retrieval/process-retrieve-full-document/api-validation-rules.svg)

If at least one validation rule failed, API will return `400 (Bad Request)` status code:

```
{
    "message": "Invalid request body"
}
```

### API Request Format

Sample of the request:

```
{
    "initiatorsystemcode": "ABC_WEB_APP",
    "requestorid": "REQUESTOR_COGNITO_ID",
    "requestorip": "192.168.1.1",
    "documenttype": "insurance",
    "documentid": "insurance/verified/PROVIDER_COGNITO_ID_1/claims/CLAIM_2024_12_31_12345667788.PDF"
}

```

### API Response Format

Sample of the response:

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