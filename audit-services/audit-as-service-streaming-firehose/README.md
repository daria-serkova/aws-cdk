# Audit As a Service - Data Streaming Through Amazon Firehose

## Overview

The **Audit As a Service** (AAAS) system enables the efficient tracking, recording, and storage of audit events for various business operations. Leveraging [**Amazon Firehose**](https://aws.amazon.com/firehose/), this solution provides scalable and reliable data streaming capabilities, ensuring audit logs are processed and stored in real-time.

## Key Features
- **Scalable Data Ingestion**: Seamlessly handles large volumes of audit logs from diverse sources, ensuring no data loss and minimal latency.
- **Flexible Data Processing**: Stream audit events through Amazon Firehose, which can transform, format, and enrich the data before delivering it to the destination.
- **Multiple Storage Options**: The system supports integration with Amazon S3 for long-term storage, Amazon Redshift for real-time analytics, and Amazon Elasticsearch for quick search and reporting.
- **Real-Time Monitoring**: Leverages AWS CloudWatch for tracking the performance of data streams, ensuring high availability and operational efficiency.
- **Customizable Audit Policies**: Offers flexibility to define audit triggers and customize how different audit events are processed based on business needs.

This system is ideal for organizations looking to implement an automated, highly available, and cost-effective solution to meet compliance, reporting, and operational auditing requirements.

## Why Standalone Service?

1. Centralized Audit Management:
    - **Consistency:** A centralized audit service ensures that audit logging is consistent across all modules. This can be crucial for maintaining compliance with healthcare regulations such as HIPAA or GDPR.
    - **Ease of Maintenance:** Updates, enhancements, and bug fixes to the audit functionality need to be implemented only once in the AaaS, rather than in each module individually.

2. Scalability:

    - **Modular Growth:** As your platform grows, new modules can easily integrate with the existing audit service, reducing the time and effort needed to build auditing capabilities from scratch.
    - **Performance:** A dedicated service can be optimized specifically for handling audit logs, ensuring that it scales efficiently with the increasing volume of data.

3. Separation of Concerns:

    - **Decoupling:** By separating audit logic from business logic, you can maintain a cleaner codebase. This makes your modules more focused on their core responsibilities.
    - **Flexibility:** Changes in auditing requirements (e.g., the level of detail needed in logs or changes in audit storage solutions) can be managed independently from the rest of your application.

4. Enhanced Security:

    - **Data Protection:** Centralizing audit data can make it easier to implement strict security measures, such as encryption, access control, and logging of access to audit logs.
    - **Compliance:** It simplifies compliance reporting by providing a single source of truth for all audit logs.

5. Advanced Analytics and Monitoring:

    - **Insights:** A centralized audit service can provide a unified view for monitoring, analyzing, and reporting on activities across the entire platform, helping to identify patterns, anomalies, or potential security threats.
    - **Alerting:** You can implement alerting mechanisms within the audit service to trigger notifications or actions based on certain events or thresholds.

6. Reuse Across Different Applications:

    - **Cross-Module Use:** If you have other applications or external systems that need auditing, they can leverage the same service, ensuring consistency across your entire ecosystem.

7. Future-Proofing:

    - **Adaptability:** As auditing requirements evolve, such as needing to integrate with newer technologies or services, the AaaS can be updated to accommodate these changes without disrupting the other modules.

## Architecture

Please refer to [Solution Architecture Document](./architecture/) for details.


## Getting Started

### Prerequisites
1. AWS Account
2. AWS CLI configured
3. Node.js installed
4. AWS CDK installed

### Deployment
1. Clone the repository:
     ```sh
     git clone https://github.com/daria-serkova/aws-cdk.git
     cd audit-services/audit-as-service-streaming-firehose
     ```
2. Install dependencies:
     ```sh
     npm install
     ```
3. Copy file `sample-env.txt` to `.env` and update with project specific values
4. Deploy the stack using CDK:
     ```sh
     cdk deploy
     ```

### Usage

Configure data source application to send audit events into Audit as a Service:

1. Install AWS SDK for your programming language (e.g., JavaScript, Python, or Java).
2. Configure AWS credentials in your data source application to allow access to the Amazon Firehose service. Use an IAM role with appropriate permissions to write to the Firehose delivery stream.
3. Send Audit Event data. Sample:

```
const AWS = require('aws-sdk');
const firehose = new AWS.Firehose();

const auditEvent = {
  "eventType": "USER_LOGIN",
  "eventTimestamp": "2024-09-04T12:00:00Z",
  "userId": "12345",
  "deviceType": "Mobile",
  "ipAddress": "192.168.1.1"
}
const params = {
  DeliveryStreamName: 'audit-events-firehose',
  Record: {
    Data: JSON.stringify(auditEvent) + '\n' // Audit event JSON
  }
};

firehose.putRecord(params, function(err, data) {
  if (err) console.log(err, err.stack); // Log errors
  else console.log('Audit event sent:', data); // Success response
});

```