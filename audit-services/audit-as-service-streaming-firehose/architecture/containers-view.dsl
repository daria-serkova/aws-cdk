workspace {

    model {
        uiApplication = softwareSystem "Compliance and Security UI Applications" {
            description "A user interacting with the audit management system through UI app."
        }
        eventProducers = softwareSystem "Event Producers" {
            description "Services that generate audit events whenever a significant action occurs (e.g., user authentication, document upload, data access)."
        }

        system = softwareSystem "Audit Management System" {
            description "Handles audit data collection, storage, and monitoring."

            apiGateway = container "API Gateway" {
                description "Front door for all audit-related API requests."
                technology "AWS API Gateway"
            }

            auditStorage = container "Audit Storage" {
                description "Securely stores audit events."
                technology "AWS DynamoDB"
            }

            lambdaFunctions = container "Lambda Functions" {
                description "Executes specific tasks related to audit data."
                technology "AWS Lambda"
            }

            cloudWatch = container "CloudWatch" {
                description "Provides real-time monitoring and logging of audit events."
                technology "AWS CloudWatch"
            }

            s3 = container "S3 (Simple Storage Service)" {
                description "Long-term storage for audit logs."
                technology "AWS S3"
            }

            kms = container "KMS (Key Management Service)" {
                description "Secures audit data with encryption."
                technology "AWS KMS"
            }

            uiApplication -> apiGateway "Sends 'Get' audit-related requests"
            eventProducers ->  apiGateway "Sends 'Create' audit-related requests"
            apiGateway -> lambdaFunctions "Routes requests"
            lambdaFunctions -> auditStorage "Sends detailed, queryable audit events (short-term lookup)"
            lambdaFunctions -> cloudWatch "Real-time monitoring and debugging"
            lambdaFunctions -> s3 "Stores logs for long-term storage (historical and compliance)"
            auditStorage -> kms "Encrypts data at rest"
            s3 -> kms "Encrypts data at rest"
        }
    }

    views {
        container system {
            include *
            autolayout lr
        }

        theme default
    }
}
