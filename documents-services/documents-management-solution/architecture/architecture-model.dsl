workspace {

    model {
        
        user = person "User" {
            description "A user of the Document Management System"
        }
        
        verificationTeam = person "Verification Team" {
            description "A team that reviews and approves documents"
        }
        
        documentManagementSystem = softwareSystem "Document Management System" {
            description "Manages the storage, retrieval, and processing of documents."
            
            apiGateway = container "API Gateway" {
                description "Handles incoming API requests and routes them to the appropriate services."
                technology "AWS API Gateway"
            }
            
            documentStorage = container "Document Storage" {
                description "Stores and manages document files securely."
                technology "AWS S3"
            }
            
            metadataDatabase = container "Metadata Database" {
                description "Stores metadata associated with each document for easy retrieval and management."
                technology "AWS DynamoDB"
            }
            
            stepFunctions = container "Step Functions" {
                description "Orchestrates complex workflows for document processing."
                technology "AWS Step Functions"
            }
            
            lambdaFunctions = container "Lambda Functions" {
                description "Executes serverless functions for document processing tasks."
                technology "AWS Lambda"
            }
            
            cloudWatch = container "CloudWatch" {
                description "Monitors and logs events within the system."
                technology "AWS CloudWatch"
            }
            
            kms = container "KMS (Key Management Service)" {
                description "Handles encryption keys for securing document data."
                technology "AWS KMS"
            }
            
            cognito = container "Cognito" {
                description "Manages user authentication and access control."
                technology "AWS Cognito"
            }
        }
        
        // External systems
        userDashboard = softwareSystem "User Documents Dashboard" {
            description "The user-facing interface where users can view and manage their documents."
        }

        verificationUI = softwareSystem "Verification Team UI" {
            description "Interface used by the verification team to review and approve documents."
        }

        thirdPartyAuditService = softwareSystem "Third-Party Audit Service" {
            description "External service for auditing document access and modifications."
        }

        thirdPartyEmailService = softwareSystem "Third-Party Email Service" {
            description "External service for sending notifications and emails related to document processes."
        }
        
        // Define relationships between the containers
        apiGateway -> stepFunctions "Routes requests to"
        stepFunctions -> lambdaFunctions "Invokes for processing"
        lambdaFunctions -> documentStorage "Stores/Retrieves Documents"
        lambdaFunctions -> metadataDatabase "Stores/Retrieves Metadata"
        lambdaFunctions -> cloudWatch "Logs errors"
        lambdaFunctions -> thirdPartyAuditService "Sends audit data to"
        lambdaFunctions -> thirdPartyEmailService "Sends email notifications via"
        documentStorage -> kms "Encrypts/Decrypts Documents"
        metadataDatabase -> kms "Encrypts/Decrypts Tables"
        cognito -> apiGateway "Authenticates API Requests"
        
        // Define relationships between the external systems and the Document Management System
        userDashboard -> apiGateway "Sends document requests via"
        verificationUI -> apiGateway "Sends review requests via"
        
        // Define relationships between the external actors and external systems
        user -> userDashboard "Accesses"
        verificationTeam -> verificationUI "Accesses"
    }
    
    views {
        systemContext documentManagementSystem {
            include user
            include verificationTeam
            include userDashboard
            include verificationUI
            include thirdPartyAuditService
            include thirdPartyEmailService
            autolayout lr
        }

        container documentManagementSystem {
            include apiGateway
            include documentStorage
            include metadataDatabase
            include stepFunctions
            include lambdaFunctions
            include cloudWatch
            include kms
            include cognito
            autolayout lr
        }

        theme default
    }
}
