# Documents Backup and Disaster Recovery

## Document Backup Overview

Document backup is the process of creating copies of important documents and data to ensure that they are preserved in the event of loss, corruption, or other data-related issues. These backups are stored separately from the original data, often in different locations or on different storage media, to provide redundancy and enhance data security.

## Disaster Recovery Overview

Disaster recovery (DR) refers to the strategies, policies, and procedures put in place to restore critical business operations and data after a catastrophic event, such as natural disasters, cyberattacks, hardware failures, or other disruptions. The goal of disaster recovery is to minimize downtime and data loss, ensuring that business functions can resume quickly and efficiently.

## Why Document Backup and Disaster Recovery are needed

Document backup and disaster recovery are critical components of a robust data management strategy. They provide essential protection against data loss, ensure business continuity, and help organizations comply with regulatory requirements. By implementing automated backup processes, cross-region replication, and comprehensive disaster recovery plans, businesses can safeguard their data, maintain operational resilience, and quickly recover from unexpected events. While AWS S3 provides a highly reliable and durable storage solution with a Service Level Agreement (SLA) of 99.99% availability and 99.999999999% (11 nines) durability, there is still a need of implementing backups or additional redundancy:

### Protection Against Data Loss

- **Scenario:** Accidental deletion, hardware failure, software bugs, or cyberattacks can lead to data loss.
- **Importance:** Regular backups ensure that a recent copy of data is always available for restoration, preventing permanent loss of critical information.

### Business Continuity

- **Scenario:** Natural disasters, power outages, or other catastrophic events can disrupt business operations.
- **Importance:** Disaster recovery plans ensure that businesses can quickly resume operations, minimizing downtime and financial losses.

### Compliance and Regulatory Requirements

- **Scenario:** Many industries have strict regulations regarding data retention and protection, such as healthcare, finance, and legal sectors. Example:
    
    - The HIPAA Security Rule requires covered entities to implement policies and procedures for creating, receiving, maintaining, and transmitting ePHI. This includes having a data backup plan (45 CFR 164.308(a)(7)(ii)(A)) and a disaster recovery plan (45 CFR 164.308(a)(7)(ii)(B)).
    - FedRAMP provides a standardized approach to security assessment, authorization, and continuous monitoring for cloud products and services used by U.S. federal agencies. FedRAMP requires that cloud service providers implement redundancy measures to ensure high availability and durability. This includes geographic redundancy to protect against data loss due to regional outages.
    - PCI DSS Requirement 3.1 specifies the need to keep cardholder data storage to a minimum by implementing data retention and disposal policies, while Requirement 3.5.3 requires the storage of encryption keys in as few locations as possible and to protect the keys against unauthorized access.

- **Importance:** Backups and disaster recovery plans help organizations comply with legal requirements, avoiding fines and legal consequences.

### Mitigation of Cybersecurity Threats

- **Scenario:** Ransomware attacks and other cyber threats can compromise or encrypt data, making it inaccessible.
- **Importance:** Having secure backups allows organizations to restore data without yielding to ransom demands, ensuring data integrity and availability.

### Preservation of Historical Data

- **Scenario:** Businesses may need access to historical data for audits, reporting, or analysis.
- **Importance:** Backups provide a way to store and retrieve historical versions of documents and data, supporting business intelligence and compliance needs.

### Data Integrity and Corruption Prevention

- **Scenario:** Data corruption can occur due to software errors, malware, or hardware malfunctions.
- **Importance:** Backups ensure that uncorrupted versions of data are available, allowing for quick recovery and continued operations.

### Operational Resilience

- **Scenario:** Businesses need to maintain resilience against various operational risks.
- **Importance:** A well-designed disaster recovery plan ensures that businesses can withstand and recover from unexpected events, maintaining trust and reliability.

## Key Components of Document Backup and Disaster Recovery

1. **Automated Backup Processes:** Regularly scheduled backups that run automatically to ensure data is consistently backed up without manual intervention.
2. **Cross-Region Replication:** Replicating data across different geographic locations to provide redundancy and protect against regional disasters.
3. **Lifecycle Policies:** Automatically transitioning data to cost-effective storage classes based on access patterns and data age.
4. **Testing and Validation:** Regularly testing backup and recovery procedures to ensure they work as expected and data integrity is maintained.
5. **Recovery Objectives:** Defining Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) to set acceptable levels of downtime and data loss.
6. **Security Measures:** Encrypting backup data in transit and at rest to protect against unauthorized access and ensuring secure storage practices.

### Automated Backup Processes

**Description:** Automated backup processes ensure that critical documents are regularly and systematically backed up without manual intervention.

**Implementation:**

1. **Backup Scheduling:** Use AWS Backup to create and manage backup plans that automatically back up data at specified intervals (e.g., hourly, daily, weekly).
2. **Lifecycle Policies:** Configure S3 lifecycle policies to automatically transition objects to different storage classes (e.g., S3 Standard to S3 Glacier) based on their age and access patterns.
3. **Versioning:** Enable versioning on S3 buckets to keep multiple versions of an object, protecting against accidental deletions or overwrites.
4. **AWS Lambda:** Use Lambda functions to automate custom backup tasks, such as copying objects to backup buckets or other AWS services.

### Cross-Region Replication

**Description:** Cross-region replication involves duplicating data across different geographic locations to ensure redundancy and protect against regional disasters. This enhances data availability and durability by storing copies in diverse locations.

**Implementation:**

1. **S3 Cross-Region Replication (CRR):** Set up CRR on Amazon S3 buckets to automatically replicate objects to a bucket in another AWS region.
2. **Configuration:** Create a replication rule in the S3 bucket settings, specifying the source and destination buckets and regions.
3. **Permissions:** Ensure the necessary IAM roles and policies are in place to allow replication.
4. **Monitoring:** Use CloudWatch to monitor replication status and set up alarms for failures.

### Lifecycle Policies

**Description:** Lifecycle policies automate the transition of data to more cost-effective storage classes based on access patterns and data age. This helps optimize storage costs while maintaining data accessibility and compliance with retention policies.

**Implementation:**

1. **S3 Lifecycle Rules:** Define lifecycle rules for S3 buckets to transition objects to different storage classes (e.g., S3 Standard to S3 Glacier) or delete them after a specified period.
2. **Policy Creation:** Create AWS CDK lifecycle rules specifying the criteria for transitioning or expiring objects.
3. **Configuration:** Set transition actions (e.g., move to Glacier after 30 days) and expiration actions (e.g., delete after 365 days).
4. **Validation:** Regularly review and update lifecycle policies to ensure they align with data retention and access requirements.

### Testing and Validation

**Description:** Regularly testing and validating backup and recovery procedures ensure they function correctly and data integrity is maintained. This proactive approach helps identify and resolve issues before actual disasters occur.

**Implementation:**

1. **Backup Testing:** Periodically restore data from backups to verify the completeness and accuracy of the backup processes.
2. **Automated Testing:** Use AWS Lambda functions to automate the testing of backup restorations and report any discrepancies.
3. **Documentation:** Maintain detailed documentation of backup and recovery procedures, including test results and any corrective actions taken.
4. **Disaster Recovery Drills:** Conduct regular disaster recovery drills to simulate various failure scenarios and ensure all team members are familiar with recovery procedures.

### Recovery Objectives

**Description:** Defining Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) sets acceptable levels of downtime and data loss. These metrics guide the design and implementation of backup and recovery strategies.

**Implementation:**

1. **RTO/RPO Definition:** Collaborate with stakeholders to define acceptable RTO and RPO values for different types of data and applications.
    1. **RTO:** Determine the maximum acceptable downtime for each critical system and document the steps needed to achieve this target.
    2. **RPO:** Define the maximum acceptable amount of data loss (e.g., no more than 15 minutes of data) and ensure backup frequencies align with this goal.
2. **Monitoring and Reporting:** Use CloudWatch and other monitoring tools to track actual recovery times and data loss during testing and real incidents.

### Security Measures

**Description:** Implementing robust security measures ensures that backup data is protected from unauthorized access and maintains data integrity. This includes encrypting data both in transit and at rest and following secure storage practices.

**Implementation:**

1. **Encryption:** Use AWS Key Management Service (KMS) to encrypt data stored in S3 buckets and other AWS services.
    1. **In Transit:** Enable SSL/TLS for data transfer to protect data in transit.
    2. **At Rest:** Configure S3 bucket policies to enforce server-side encryption (SSE) using AWS KMS keys.
2. **Access Controls:** Implement strict IAM policies to control access to backup data and ensure only authorized users and services can access it.
3. **Bucket Policies:** Use S3 bucket policies to restrict access based on IAM roles, IP addresses, or other criteria.
4. **Audit Logs:** Enable CloudTrail to log all access and management events for backup data, and regularly review these logs for unauthorized access attempts.

## Associated Cost

Calculation logic on the following scenario:

1. Number of users: 10,000
2. Number of files per user: 15
3. Size of each file: 5 MB
4. Total data: 10,000 x 15 x 5 MB = 750,000 MB (~ 750 GB)

Price of S3 buckets storage itself for the same scenario (without backups): ~19$

### Through AWS Backup

1. **Storage:** The cost for backing up S3 data using AWS Backup is typically priced per GB-month of storage. As of the August 2024, the price is approximately $0.10 per GB-month. Monthly cost: 750 GB * $0.10/GB = **$75**
2. **Restore Requests:** If you need to restore data, AWS charges for the restore requests. The cost can vary, but typically it's around $0.02 per GB for the first retrieval and lower for subsequent requests.
3. **Data Transfer Costs:** Data transfer costs may apply when retrieving data, especially if restoring data across regions. However, these costs are typically minimal for intra-region transfers.

### Custom Backup Process

You can implement a custom backup process by copying files into another S3 bucket (through AWS Lambda for example). This approach can potentially reduce costs, especially if you utilize S3's storage classes designed for infrequently accessed or archival data:

1. **Create a Backup S3 Bucket:** Set up a new S3 bucket in the same or different region for your backups.
2. **Set Up Automated Copying:** Use AWS Lambda, AWS Data Pipeline, or AWS Step Functions to automate the copying of files from the primary S3 bucket to the backup bucket. You can also use the AWS CLI or SDKs to schedule regular copies via scripts.
3. **Utilize S3 Storage Classes:**
    1. **S3 Standard-IA (Infrequent Access):** Use this class for data that is accessed less frequently but needs to be readily available when required. It costs less than S3 Standard.
    2. **S3 One Zone-IA:** Similar to Standard-IA but stored in a single availability zone. It is cheaper but has a higher risk if that zone fails.
    3. **S3 Glacier:** Suitable for long-term archival. It is very cost-effective for data that is rarely accessed and can tolerate retrieval times of minutes to hours.
    4. **S3 Glacier Deep Archive:** The lowest-cost storage class for data that is rarely accessed and can tolerate retrieval times of hours.
4. **Set Up Lifecycle Policies:** Configure lifecycle policies on your backup bucket to automatically transition objects to cheaper storage classes based on their age. Example: Transition files to S3 Glacier after 30 days and to S3 Glacier Deep Archive after 180 days.

Cost of the solution for the same scenario:

1. Total data: 750 GB
2. Cost per GB-month for S3 Glacier: $0.004
3. If using the same region, data transfer costs are negligible.
4. Monthly cost: 750 GB * $0.004/GB = **$3**

Using a custom backup process can significantly reduce costs, especially for data that doesn't require frequent access. However, it requires more setup and maintenance compared to using AWS Backup.