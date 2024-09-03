components = container "All Components" {
                description "Defines communication between serverless resources"
                technology "AWS Serverless"
                // API Gateway Endpoints
                documentUploadAPI = component "Document Upload API" {
                    description "API for generating S3 Pre-Sign URLs."
                    technology "REST"
                }
                documentGetFullDetailsAPI = component "Get Document Details API" {
                    description "API for retrieving document's URL and metadata"
                    technology "REST"
                }
                documentGetUrlAPI = component "Get Document Url API" {
                    description "API for retrieving document's URL"
                    technology "REST"
                }
                documentGetMetadataAPI = component "Get Document Metadata API" {
                    description "API for retrieving document's metadata"
                    technology "REST"
                }
                documentsGetListByStatusAPI = component "Get Documents List by Status API" {
                    description "API for retrieving list of documents with specified status."
                    technology "REST"
                }
                documentsGetListByOwnerAPI = component "Get Documents List by Owner API" {
                    description "API for retrieving list of documents for specified owner."
                    technology "REST"
                }
                documentVerifyAPI = component "Verification API" {
                    description "API for document verification."
                    technology "REST"
                }
                // Step Functions
                getDocumentDetailsWorkflow = component "Get Full Document Details Workflow" {
                    description "Orchestration for document's URL generation, metadata retriaval and auditing"
                    technology "AWS State Machine"
                }
                getDocumentUrlWorkflow = component "Get Document URL Workflow" {
                    description "Orchestration for document's URL generation and auditing"
                    technology "AWS State Machine"
                }
                getDocumentMetadataWorkflow = component "Get Document Metadata Workflow" {
                    description "Orchestration for document's metadata retriaval and auditing"
                    technology "AWS State Machine"
                }
                verifyDocumentWorkflow = component "Verify Document Workflow" {
                    description "Orchestration for document's verification process and auditing"
                    technology "AWS State Machine"
                }
                
                // Lambdas
                generatePresignedUploadUrlsLambda = component "Generate Presigned Upload Urls Lambda" {
                    description "Processor for URL generation in the upload process"
                    technology "NodeJS"
                }
                generatePresignedReadUrlsLambda = component "Generate Presigned Read Url Lambda" {
                    description "Processor for URL generation for view actions"
                    technology "NodeJS"
                }
                getListByOwnerLambda = component "Get List of Documents by Owner Lambda" {
                    description "Processor for documents list retrieval"
                    technology "NodeJS"
                }
                getListByStatusLambda = component "Get List of Documents by Status Lambda" {
                    description "Processor for documents list retrieval"
                    technology "NodeJS"
                }
                getMetadataLambda = component "Get Document Metadata Lambda" {
                    description "Processor for document's metadata retrieval"
                    technology "NodeJS"
                }
                updateMetadataLambda = component "Update Document Metadata Lambda" {
                    description "Processor for document's metadata update"
                    technology "NodeJS"
                }
                s3UpdateListenerLambda = component "S3 Update Listener Lambda" {
                    description "Processor for captchuring upload events, creation of metadata record and audit record"
                    technology "NodeJS"
                }
                storeAuditEventLambda = component "Store Audit Event Lambda" {
                    description "Processor for sending audit event to Audit Service"
                    technology "NodeJS"
                }
            }


             // Define relationships between components
        documentUploadAPI -> generatePresignedUploadUrlsLambda "Triggers"
        
        documentGetFullDetailsAPI -> getDocumentDetailsWorkflow "Starts workflow"
        getDocumentDetailsWorkflow -> getMetadataLambda "Triggers"
        getDocumentDetailsWorkflow -> generatePresignedReadUrlsLambda "Triggers"
        getDocumentDetailsWorkflow -> storeAuditEventLambda "Sends 'View Content' and 'View Metadata' audit events"
        
        documentGetUrlAPI -> getDocumentUrlWorkflow "Starts workflow"
        getDocumentUrlWorkflow -> generatePresignedReadUrlsLambda "Triggers"
        getDocumentUrlWorkflow -> storeAuditEventLambda "Sends 'View Content' audit event"
        
        documentGetMetadataAPI -> getDocumentMetadataWorkflow "Starts workflow"
        getDocumentMetadataWorkflow -> getMetadataLambda "Triggers"
        getDocumentMetadataWorkflow -> storeAuditEventLambda "Sends 'View Metadata' audit event"
        
        
        
        
        documentVerifyAPI -> verifyDocumentWorkflow "Triggers"
        documentsGetListByStatusAPI -> getListByStatusLambda "Triggers"
        documentsGetListByOwnerAPI -> getListByOwnerLambda "Triggers"



         component components {
            include *
            autolayout lr
        }