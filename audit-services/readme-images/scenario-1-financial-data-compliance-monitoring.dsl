workspace {

    model {
        // Users
        compliance_officer = person "Compliance Officer" {
            description "Responsible for ensuring that financial transactions and account activities comply with regulations such as SOX and AML."
        }

        risk_manager = person "Risk Manager" {
            description "Monitors and manages risks related to financial transactions and ensures appropriate mitigation strategies."
        }

        financial_analyst = person "Financial Analyst" {
            description "Analyzes transaction data to identify trends, anomalies, and potential compliance issues."
        }

        it_admin = person "IT Administrator" {
            description "Manages IT infrastructure, including security configurations, access controls, and system maintenance."
        }

        auditor = person "Auditor" {
            description "Conducts independent audits of financial transactions and compliance with regulations like SOX and AML."
        }

        // Internal Systems
        transaction_system = softwareSystem "Transaction Processing System" {
            description "System where financial transactions are recorded and processed."
        }

        compliance_monitoring = softwareSystem "Compliance Monitoring System" {
            description "Monitors financial transactions and account activities to ensure compliance with regulations such as SOX and AML. Includes transaction logging, real-time alerts, and compliance reporting features."
        }

        security_info_event_mgmt = softwareSystem "Security Information and Event Management (SIEM) System" {
            description "Aggregates and analyzes security-related data from across the organization for real-time alerts and reporting."
        }

        identity_management = softwareSystem "Identity and Access Management (IAM) System" {
            description "Manages user identities and access controls across the financial organization."
        }

        regulatory_reporting = softwareSystem "Regulatory Reporting System" {
            description "Generates and submits regulatory compliance reports to external regulatory bodies."
        }

        fraud_detection = softwareSystem "Fraud Detection System" {
            description "Monitors transaction patterns for signs of fraudulent activity and generates alerts for suspicious transactions."
        }

        // Relationships
        financial_analyst -> transaction_system "Accesses transaction data for analysis"
        transaction_system -> compliance_monitoring "Sends transaction logs for compliance checking"
        compliance_monitoring -> transaction_system "Requests additional transaction details if needed"
        compliance_monitoring -> compliance_officer "Provides compliance reports and alerts"
        compliance_monitoring -> risk_manager "Provides risk-related insights and alerts"
        compliance_monitoring -> auditor "Provides detailed transaction logs and compliance reports"
        compliance_monitoring -> security_info_event_mgmt "Sends security-related audit logs"
        compliance_monitoring -> identity_management "Requests identity and access information for compliance checks"
        compliance_monitoring -> regulatory_reporting "Submits compliance reports to regulatory bodies"
        fraud_detection -> compliance_monitoring "Provides fraud detection alerts and data"
        it_admin -> identity_management "Manages user roles and permissions"
        it_admin -> security_info_event_mgmt "Monitors security alerts and incidents"
        auditor -> regulatory_reporting "Reviews and verifies submitted compliance reports"
        risk_manager -> compliance_monitoring "Reviews risk insights and compliance status"

        compliance_officer -> compliance_monitoring "Monitors compliance and reviews alerts"
        financial_analyst -> compliance_monitoring "Provides input on transaction patterns and anomalies"
        it_admin -> compliance_monitoring "Ensures proper configuration and security of compliance monitoring systems"
        auditor -> compliance_monitoring "Conducts audits and reviews compliance reports"
    }

    views {
        systemContext compliance_monitoring {
            include *
        }

        theme default
    }
}
