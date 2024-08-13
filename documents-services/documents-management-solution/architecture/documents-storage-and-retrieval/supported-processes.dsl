workspace {
    model { 
        documentManagementSystem = softwareSystem "Document Management System - Storage and Retrieval" {
            description "Manages the storage and retrieval of documents."
            
            uploadDocumentWorkflow = container "Process: Upload Document" {
                description "Handles document upload process including audit"
            }
            getFullDocumentDetailsWorkflow = container "Process: Get Full Document Details" {
                description "Handles document retrieval process including audit"
            }
            getDocumentUrlWorkflow = container "Process: Get Document URL" {
                description "Handles document retrieval process including audit"
            }
            getDocumentMetadataWorkflow = container "Process: Get Document Metadata" {
                description "Handles document retrieval process including audit"
            }
            getDocumentsListByStatusWorkflow = container "Process: Get Documents List By Status" {
               description "Handles document list retrieval process"
            }
            getDocumentsListByOwnerWorkflow = container "Process: Get Documents List By Owner" {
                description "Handles document list retrieval process"
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
