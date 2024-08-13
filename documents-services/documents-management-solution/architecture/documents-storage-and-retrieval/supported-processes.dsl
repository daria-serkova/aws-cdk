workspace {
    model { 
        documentManagementSystem = softwareSystem "Document Management System" {
            description "Manages the storage, retrieval, and processing of documents."
            
            uploadDocumentWorkflow = container "Process: Upload Document" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            getFullDocumentDetailsWorkflow = container "Process: Get Full Document Details" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            getDocumentUrlWorkflow = container "Process: Get Document URL" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            getDocumentMetadataWorkflow = container "Process: Get Document Metadata" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            getDocumentsListByStatusWorkflow = container "Process: Get Documents List By Status" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            getDocumentsListByOwnerWorkflow = container "Process: Get Documents List By Owner" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
            verifyDocumentWorkflow = container "Process: Verify Document" {
                description "Handles incoming API requests and routes them to the appropriate services."
            }
        }
    }
    views {
        container documentManagementSystem {
            include *
            autolayout tb
        }
        theme default
    }
}
