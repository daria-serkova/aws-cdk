# Audit As a Service - Data Streaming Through Amazon Firehose


- [Audit As a Service - Data Streaming Through Amazon Firehose](#audit-as-a-service---data-streaming-through-amazon-firehose)
- [Overview](#overview)
- [Key Features](#key-features)
- [Advantages of Using Audit as a Service](#advantages-of-using-audit-as-a-service)
- [Architecture](#architecture)
- [Cost Estimation](#cost-estimation)
  - [Assumptions](#assumptions)
  - [AWS Pricing](#aws-pricing)
  - [Cost Estimation Table](#cost-estimation-table)
  - [Monthly Cost Breakdown](#monthly-cost-breakdown)
  - [Key Insights](#key-insights)
  - [Conclusion](#conclusion)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Deployment](#deployment)
  - [Usage](#usage)
  - [Architecture Diagrams Update](#architecture-diagrams-update)


# Overview

The **Audit As a Service** (AAAS) system enables the efficient tracking, recording, and storage of audit events for various business operations. Leveraging [**Amazon Firehose**](https://aws.amazon.com/firehose/), this solution provides scalable and reliable data streaming capabilities, ensuring audit logs are processed and stored in real-time.

# Key Features
- **Scalable Data Ingestion**: Seamlessly handles large volumes of audit logs from diverse sources, ensuring no data loss and minimal latency.
- **Flexible Data Processing**: Stream audit events through Amazon Firehose, which can transform, format, and enrich the data before delivering it to the destination.
- **Multiple Storage Options**: The system supports integration with Amazon S3 for long-term storage, Amazon Redshift for real-time analytics, and Amazon Elasticsearch for quick search and reporting.
- **Real-Time Monitoring**: Leverages AWS CloudWatch for tracking the performance of data streams, ensuring high availability and operational efficiency.
- **Customizable Audit Policies**: Offers flexibility to define audit triggers and customize how different audit events are processed based on business needs.

This system is ideal for organizations looking to implement an automated, highly available, and cost-effective solution to meet compliance, reporting, and operational auditing requirements.

# Advantages of Using Audit as a Service

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

# Architecture

For most large-scale Audit as a Service architectures, Firehose based solution is sufficient and more straightforward to use if/when:

- If your primary goal is to store audit logs in S3, Elasticsearch, or Redshift for later analysis and you don’t need to process each event immediately. Firehose is designed for **near real-time data delivery**: it delivers data with a slight delay, typically ranging from seconds to minutes, rather than instantly. This is ideal for scenarios where data freshness is important but absolute real-time processing is not required.
- When you need a straightforward, fully managed pipeline for moving audit logs from the ingestion point to a storage solution. Firehose is designed for data delivery with minimal configuration.

In following cases, consider [Kinesis Data Stream solution](#) instead:

- If your system needs to react in **real-time** to security or compliance events, such as triggering alerts or automated actions when specific types of audit events are detected.
- When integrating with systems that require continuous real-time data flow, such as real-time dashboards or monitoring systems.

Please refer to [Solution Architecture Document](./architecture/) for details.

# Cost Estimation
Cost estimation table for the **Firehose-only solution**, including the costs for **Lambda transformation** and **Amazon S3 storage**:
## Assumptions
- **Data Volume**: Each user generates 10 audit events per day, with each event being 1 KB in size.
- **Lambda Invocations for Transformation**: Each event triggers one Lambda invocation (to process each event before delivery to S3).
- **S3 Storage**: Data is delivered to **Amazon S3** after Lambda transformation.
  - **Compression**: Assume a 50% reduction in data size due to compression (GZIP).
  - **S3 Standard** storage pricing is **$0.023/GB** per month.
## AWS Pricing
- **Firehose ingestion and delivery**: $0.029 per GB ingested.
- **Lambda transformation**: $0.20 per 1 million invocations and 1 GB-second of compute time.
- **S3 Standard** storage: $0.023 per GB stored per month.

## Cost Estimation Table

| **Users**         | **Audit Events/Day**  | **Data/Day (Uncompressed)** | **Firehose Cost (Ingestion + Delivery)** | **Lambda Invocations** | **Lambda Cost**                         | **S3 Storage (Compressed 50%)** | **S3 Storage Cost/Month**         |
|-------------------|-----------------------|-----------------------------|------------------------------------------|-------------------------|-----------------------------------------|---------------------------------|-----------------------------------|
| **100 users**     | 1,000 events/day      | 1 MB/day                    | 1 MB/day × $0.029/GB = **$0.00087/day**  | 1,000/day               | 1,000/day × $0.20/million = **$0.0002/day** | 15 MB/month (compressed)         | 15 MB × $0.023/GB = **$0.00035** |
| **10,000 users**  | 100,000 events/day    | 100 MB/day                  | 100 MB/day × $0.029/GB = **$0.087/day**  | 100,000/day             | 100,000/day × $0.20/million = **$0.02/day** | 1.5 GB/month (compressed)        | 1.5 GB × $0.023/GB = **$0.0345** |
| **100,000 users** | 1,000,000 events/day  | 1 GB/day                    | 1 GB/day × $0.029/GB = **$0.29/day**     | 1,000,000/day           | 1,000,000/day × $0.20/million = **$0.20/day** | 15 GB/month (compressed)         | 15 GB × $0.023/GB = **$0.345**   |

## Monthly Cost Breakdown

| **Users**         | **Firehose Cost/Month**  | **Lambda Cost/Month** | **S3 Storage Cost/Month**  | **Total Monthly Cost**        |
|-------------------|--------------------------|-----------------------|----------------------------|-------------------------------|
| **100 users**     | $0.00087 × 30 = **$0.026** | $0.0002 × 30 = **$0.006** | **$0.00035**                 | **$0.03235/month**            |
| **10,000 users**  | $0.087 × 30 = **$2.61**   | $0.02 × 30 = **$0.60**  | **$0.0345**                  | **$3.2445/month**             |
| **100,000 users** | $0.29 × 30 = **$8.70**    | $0.20 × 30 = **$6.00**  | **$0.345**                   | **$15.045/month**             |

## Key Insights
- **Firehose** remains the dominant cost component at larger scales, but it's still significantly cheaper than using Kinesis Data Streams or API Gateway.
- **Lambda transformation** costs are minimal, especially for smaller user bases. However, they can scale up with higher event volumes.
- **S3 storage** is also a minimal cost, especially if you use compression (50% reduction is assumed here, though it could vary).

## Conclusion
By using **Firehose** with **Lambda transformation** and **S3 storage**, you can create a cost-effective audit ingestion pipeline, even at large scales. For **100,000 users**, the total monthly cost remains just over $15, making this architecture both affordable and scalable.


# Getting Started

## Prerequisites
1. AWS Account
2. AWS CLI configured
3. Node.js installed
4. AWS CDK installed

## Deployment
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

## Usage

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

## Architecture Diagrams Update

Repository contains files `workspace.dsl` and `workspace.json` that defines [structurizr diagrams models](https://docs.structurizr.com/). In order to update architecture diagrams in the repository, do following steps:

1. Install Java on the local machine
2. Download `structurizr-lite.war` file from [https://github.com/structurizr/lite/releases](https://github.com/structurizr/lite/releases)
3. Start the application through the terminal by executing command `java -jar structurizr-lite.war /path/to/repository/folder/with/workspace/files/you/want/to/update`
4. Open browser [http://localhost:8080/workspace/diagrams](http://localhost:8080/workspace/diagrams) to render diagram code.
5. Update `workspace.dsl` file and check rendering through the browser. You can drag and drop elements for proper layout. It automatically will regenerate `workspace.json` file with new coordinates.
6. When completed with diagram update, export new image and replace the previous one with it in the repository.