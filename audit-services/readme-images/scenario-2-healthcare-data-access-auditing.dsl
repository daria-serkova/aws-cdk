workspace {

    model {
        // Users
        compliance_officer = person "Compliance Officer" {
            description "Responsible for ensuring that access to electronic health records (EHRs) complies with HIPAA regulations."
        }

        it_admin = person "IT Administrator" {
            description "Manages the infrastructure and ensures secure access to the EHR system."
        }

        healthcare_provider = person "Healthcare Provider" {
            description "Doctors, nurses, and other medical staff who access EHRs to provide patient care."
        }

        auditor = person "External Auditor" {
            description "Performs audits on behalf of regulatory bodies to ensure compliance with HIPAA and other regulations."
        }

        // Internal Systems
        ehr_system = softwareSystem "Electronic Health Records (EHR) System" {
            description "System where patient health records are stored and accessed by healthcare providers."
        }

        audit_solution = softwareSystem "Healthcare Data Access Auditing System" {
            description "Monitors and audits access to electronic health records (EHRs) to ensure compliance with HIPAA regulations. Includes access monitoring and compliance checking features."
        }

        security_info_event_mgmt = softwareSystem "Security Information and Event Management (SIEM) System" {
            description "Aggregates security-related data from across the organization for real-time analysis and reporting."
        }

        identity_management = softwareSystem "Identity and Access Management (IAM) System" {
            description "Manages user identities and access controls across the healthcare organization."
        }

        external_compliance_reporting = softwareSystem "External Compliance Reporting System" {
            description "External service for submitting compliance reports to regulatory bodies."
        }

        // Relationships
        healthcare_provider -> ehr_system "Accesses patient records"
        ehr_system -> audit_solution "Sends access logs for auditing"
        audit_solution -> ehr_system "Requests additional data if necessary for compliance checks"
        audit_solution -> compliance_officer "Provides compliance reports and alerts"
        audit_solution -> it_admin "Notifies about potential security or compliance issues"
        audit_solution -> auditor "Provides detailed audit trails and reports"
        audit_solution -> security_info_event_mgmt "Sends security-related audit logs"
        audit_solution -> identity_management "Requests identity and access information"
        audit_solution -> external_compliance_reporting "Submits regulatory compliance reports"

        compliance_officer -> audit_solution "Monitors access logs and ensures HIPAA compliance"
        it_admin -> identity_management "Manages user roles and permissions"
        external_compliance_reporting -> auditor "Submits compliance data for review"
    }

    views {
        systemContext audit_solution {
            include *
        }

        theme default
    }
}
