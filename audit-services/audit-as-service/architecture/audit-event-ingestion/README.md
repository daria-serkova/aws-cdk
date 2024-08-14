# Audit Event Ingestion
Audit Event Ingestion is the foundational process within an Audit As a Service (AaaS) solution that captures and records events from various systems, applications, and services within an organization. This process ensures that all relevant activities and transactions are logged in a structured and consistent manner, enabling comprehensive auditing, monitoring, and compliance management.

# Key Components

## Event Sources

Event sources represent the various systems, applications, and services from which audit events are collected within an organization. These sources can vary widely depending on the organization's technology stack and operational needs. 

The file `aws-cdk/audit-services/audit-as-service/helpers/utils.ts` (SupportedInitiatorSystemCodes) is used to configure and manage the supported event sources. It ensures that each event includes the appropriate initiatorSystemCode value to accurately identify the source of the event. This configuration file is critical for maintaining consistency and traceability of audit events across different systems and services. By defining these sources and their corresponding initiatorSystemCode values, organizations can ensure that their audit logs are comprehensive, reliable, and traceable back to the originating systems. This facilitates better monitoring, compliance, and analysis of organizational activities.

Sample of supported event sources:

1. Document Management (Web App)
2. Document Management (Mobile App)
3. Billing System (Web App)
4. Customer Support System (Web App)
5. Customer Relationship Management (CRM) System (Web App)
6. Enterprise Resource Planning (ERP) System (Web App)
4. etc...

Project team will need to add their source application to the supported list before starting to send ingestion requests to Audit Service.

## Events Types

This audit service supports following types of audit events out-of-the-box:

1. [Use Access](https://github.com/daria-serkova/aws-cdk/tree/main/audit-services/audit-as-service/architecture/audit-event-ingestion/user-access)
2. [User Account Managment](https://github.com/daria-serkova/aws-cdk/tree/main/audit-services/audit-as-service/architecture/audit-event-ingestion/user-account-management)
3. [Documents Management](https://github.com/daria-serkova/aws-cdk/tree/main/audit-services/audit-as-service/architecture/audit-event-ingestion/documents-management)

List is configured inside file `aws-cdk/audit-services/audit-as-service/helpers/utils.ts` (SupportedEventTypes)

Allowed attributes for different type of audit events also configured on the API Request Model side: `aws-cdk/audit-services/audit-as-service/lib/resources/api-gateway.ts` (auditStoreEventsEndpoin -> requestModel)

All additional events need to be added by project team before starting to send ingestion requests to Audit Service.

## Event Collection Mechanisms

## Event Transformation & Normalization