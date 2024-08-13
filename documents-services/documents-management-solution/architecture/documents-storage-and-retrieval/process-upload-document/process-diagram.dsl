workspace {
    model {
        uiApplication = softwareSystem "UI Application"
        auditService = softwareSystem "Audit Service"
        documentManagementSystem = softwareSystem "Document Management System" {
            description "Manages the storage, retrieval, and processing of documents."
            uploadDocument = container "Upload Document" {
                description "Handles processing of documents upload"
                technology "AWS Serverless"
                
                documentUploadAPI = component "Document Upload API" {
                    description "API for generating S3 pre-signed upload URLs."
                    technology "AWS API Gateway - REST / POST"
                }
                documentStorageS3 = component "Document Storage (S3)" {
                    description "Documents storage"
                    technology "AWS S3"
                }
                metadataStorageDynamoDBtable = component "Metadata Storage (DynamoDB)" {
                    description "Documents metadata storage"
                    technology "AWS DynamoDB"
                }
                generatePresignedUploadUrlsLambda = component "Generate Presigned Upload Urls Lambda" {
                    description "Processor for URLs generation in the upload process (5 mins expiration time)"
                    technology "AWS Lambda - NodeJS/TypeScript"
                }
                s3UpdateListenerLambda = component "S3 Upload Listener Lambda" {
                    description "Processor for captchuring upload events, creation of metadata record and audit record"
                    technology "AWS Lambda - NodeJS/TypeScript"
                }
            }
        }
        uiApplication -> documentUploadAPI "Requests list of pre-signed URLs for uploaded documents"
        documentUploadAPI -> generatePresignedUploadUrlsLambda "triggers"
        generatePresignedUploadUrlsLambda -> documentStorageS3 "generates list of URLs"
        
        uiApplication -> documentStorageS3 "Uploads documents directly through generated URLs (REST PUT)"
        s3UpdateListenerLambda -> documentStorageS3 "Listens when new file is uploaded through pre-signed URL"
        s3UpdateListenerLambda -> metadataStorageDynamoDBtable "Create metadata record in DynamoDB"
        s3UpdateListenerLambda -> auditService "Sends 'Upload' audit event"
    }
    
    views {
        component uploadDocument {
            include uiApplication
            include auditService
            include *
            autolayout lr
        }

        theme default
    }
}
