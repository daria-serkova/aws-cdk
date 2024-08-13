workspace {
    model {
        uiApplication = softwareSystem "UI Application"
        auditService = softwareSystem "Audit Service"
        documentManagementSystem = softwareSystem "Document Management System" {
            description "Manages the storage, retrieval, and processing of documents."
            process = container "Get Document Details" {
                description "Handles processing of document retrieval"
                technology "AWS Serverless"
                
                apiEndpoint = component "Document Get Full Details API" {
                    description "API to initiate workflow, that will retrieve all documents information and record audit event"
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
                stepFunction = component "Get Document Details Step Function" {
                    description "Orchestrates multi-step process of document's retrieval"
                    technology "AWS State Machine"
                }
                getDocumentMetadataLambda = component "Get Document Metadata Lambda" {
                    description "Processor for retrieving document metadata"
                    technology "AWS Lambda - NodeJS/TypeScript"
                }
                generatePresignedReadUrlLambda = component "Generate Presigned Read Url Lambda" {
                    description "Processor for URL generation in the read processes (5 mins expiration time)"
                    technology "AWS Lambda - NodeJS/TypeScript"
                }
                storeAuditEventLambda = component "Store Audit Event Lambda" {
                    description "Processor for communication with Audit Service"
                    technology "AWS Lambda - NodeJS/TypeScript"
                }
            }
        }
        uiApplication -> apiEndpoint "Requests document's details"
        apiEndpoint -> uiApplication "Returns document's details to display"
        apiEndpoint -> stepFunction "Starts Workflow"
        
        stepFunction -> getDocumentMetadataLambda "Triggers metadata retrieval"
        stepFunction -> generatePresignedReadUrlLambda "Triggers URL generation"
        stepFunction -> storeAuditEventLambda "Triggers audit event recording"
        
        getDocumentMetadataLambda -> metadataStorageDynamoDBtable "Retrieves metadata"
        generatePresignedReadUrlLambda -> documentStorageS3 "Gets secure URL"
        storeAuditEventLambda -> auditService "Sends 'View Content' and 'View Metadata' audit events"
    }
    
    views {
        component process {
            include uiApplication
            include auditService
            include *
            autolayout lr
        }

        theme default
    }
}
