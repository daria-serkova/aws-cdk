# Documents Audit

The Documents Audit functionality provides a robust and comprehensive capabilities for tracking and reporting all activities related to document management within your organization. It ensures detailed logging of document-related actions, enables compliance with industry standards, and integrates with business intelligence (BI) tools for advanced analysis and reporting (when complex analytics is needed for the project).

## Why It Is Needed

In today's regulatory environment, maintaining a detailed audit trail of document activities is crucial for compliance, security, and operational transparency. Organizations need to ensure that every action on documents is logged, monitored, and reviewed to meet regulatory requirements and safeguard sensitive information. This module helps in achieving these goals by providing:

1. **Regulatory Compliance:** Ensures adherence to industry standards such as HIPAA, GDPR, and other relevant regulations.
2. **Security:** Detects unauthorized access and potential breaches, enabling timely intervention.
3. **Operational Transparency:** Provides insights into document management processes, helping in identifying inefficiencies and improving workflows.
4. **Accountability:** Tracks user actions, ensuring that all changes and accesses are attributable to specific individuals.

## Business Scenarios

Here are some real-world scenarios where the Documents auditing is required:

1. **Healthcare:** Hospitals and clinics need to ensure that patient records are accessed and modified only by authorized personnel, maintaining a detailed audit trail for compliance with HIPAA regulations.
2. **Legal Firms:** Law firms must track access to sensitive legal documents and ensure that any modifications are logged for accountability and compliance with legal standards.
3. **Finance:** Financial institutions require detailed audit logs to comply with regulations such as Sarbanes-Oxley (SOX) and to monitor for fraudulent activities.
4. **Government Agencies:** Public sector organizations need to maintain transparency and accountability by tracking document handling and ensuring compliance with governmental regulations.
5. **Corporate:** Large enterprises must audit document access and modifications to safeguard intellectual property and ensure compliance with internal policies and external regulations.
6. **Education:** Educational institutions need to track access to student records and ensure compliance with FERPA regulations.

## Reference Architecture

### Simple Dashboard for Audit

If project’s primary goal is to build a dashboard that shows audit logs based on specific documentID (track all activities done for specified document) or userId (track all activities done by specified user), simplified architecture (API Gateway, Lambdas / Step Functions, DynamoDB combination) is recommended:

![PlantUml Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-audit/s3-documents-audit-simplified-architecture.png)

**NOTE:** This service implements simplified architecture.

### Complex Analytics on Audit Data

Use architecture with QuickSight, Athena, and Glue (as DynamoDB alone can't efficiently handle such scenarios) if you require:

1. **Complex Analytics:** Advanced analytics, such as complex aggregations, joins, or historical trend analysis.
2. **Cross-Data Source Analysis:** Audit data needs to be combined with data from other sources (e.g., RDS, S3)
3. **Visualization Needs:** Complex visualization tool for non-technical stakeholders.

![PlantUml Diagram](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/architecture/documents-audit/s3-documents-audit-advanced-architecture.png)

## Implementation Details

### Audit Events Schema

```
{
    "auditid": "2e94e36e-491e-43fb-80bd-0b63e099318d",
    "eventtime": "1722981316605",
    "version": "dd9774hXD441S56X5ybJd4lLnEx6p0w9",
     "event": "Verified",
    "documentid": "insurance/verified/id1234567890/claims/CLAIM-0b63e099318d.PDF",
    "eventinitiator": "id0987654321",
    "eventinitiatorip": "192.168.1.1",
    "initiatorsystemcode": "ABC_SYSTEM"
}