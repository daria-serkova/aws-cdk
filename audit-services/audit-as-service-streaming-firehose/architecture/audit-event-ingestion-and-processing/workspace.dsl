workspace {

    model {
        // Audit as a Service System and Internal Containers
        dataIngestionWorkflow = softwareSystem "Data Ingestion Workflow" {
            description "Provides audit logging, tracking, and reporting capabilities, ensuring that all actions and transactions within the organization are recorded in a secure and tamper-proof manner."
            
            firehose = container "Amazon Firehose" {
                description "Data ingestion, buffering and batching, compression and encryption, delivery to destination"
                technology "Amazon Firehose"
            }

            transformationLambda = container "Transformation Lambda" {
                description "Data validation, data cleaning, data enrichment, format conversion, partition key extraction, error handling"
                technology "Amazon Lambda"
            }

            s3Bucket = container "S3 Bucket" {
                description "Stores the transformed and partitioned audit log files in a secure manner."
                technology "Amazon S3"
            }

            cloudWatch = container "CloudWatch" {
                description "Collects logs, metrics, and errors from the Transformation Lambda."
                technology "Amazon CloudWatch"
            }
        }

        // Relationships
        firehose -> transformationLambda "Triggers for event transformation"
        transformationLambda -> firehose "Returns transformed data"
        firehose -> s3Bucket "Saves transformed and partitioned events"
        transformationLambda -> cloudWatch "Sends error logs"
    }

    views {
        // Container View for the Audit as a Service workflow
        container dataIngestionWorkflow {
            include *
        }

        theme default
    }
}
