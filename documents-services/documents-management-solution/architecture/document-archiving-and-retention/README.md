# Document Archiving and Retention

Document archiving and retention are crucial components of data management that ensure documents are stored and managed in accordance with organizational policies, legal requirements, and cost considerations. Configuring automated archiving and retention policies, along with leveraging cost-effective storage options, is essential for managing data efficiently in production environments. These practices help ensure compliance with regulatory requirements, optimize storage costs, and streamline data management processes. Proper implementation of these aspects not only supports organizational goals but also enhances overall data governance and operational efficiency.

## Automated Archiving and Retention Policies

### Automated Archiving

1. **Definition:** Automated archiving refers to the process of automatically moving documents from active storage to long-term storage after they reach a certain age or meet specific criteria.
2. **Purpose:** This ensures that documents are systematically archived without manual intervention, reducing the risk of human error and ensuring compliance with data retention policies.
3. **Implementation:** Typically involves setting up lifecycle rules or policies within storage solutions to transition documents to different storage tiers (e.g., from standard S3 storage to S3 Glacier).

### Retention Policies

1. **Definition:** Retention policies dictate how long different types of documents should be kept before they are archived or deleted.
2. **Purpose:** They ensure compliance with legal, regulatory, and business requirements by defining the duration for which data should be retained.
3. **Implementation:** Retention policies are usually configured in conjunction with lifecycle management tools within storage solutions, specifying timeframes for different actions (e.g., archive after 30 days, delete after 365 days).

### Benefits of Automated Archiving and Retention

1. **Efficiency:** Reduces manual effort and the risk of errors by automating the movement and management of documents.
2. **Compliance:** Helps ensure adherence to legal and regulatory requirements by maintaining documents for required periods.
3. **Cost Savings:** Moves less frequently accessed documents to cost-effective storage solutions, reducing overall storage costs.

## Cost-Effective Storage Options

### Amazon S3 Glacier

1. **Definition:** Amazon S3 Glacier is a low-cost cloud storage service designed for data archiving and long-term backup.
2. **Use Case:** Ideal for storing data that is infrequently accessed but needs to be retained for long periods.
3. **Cost:** S3 Glacier offers significantly lower storage costs compared to standard S3 storage, making it a cost-effective solution for long-term storage.
4. **Access Time:** Retrieval times from S3 Glacier can range from minutes to hours, depending on the retrieval option chosen (e.g., Expedited, Standard, Bulk).

### Benefits of Using S3 Glacier

1. **Cost Savings:** Provides a lower-cost alternative for archiving compared to standard S3 storage or on-premises solutions.
2. **Scalability:** Scales automatically to accommodate large volumes of archived data.
3. **Durability:** Offers high durability and reliability, with data stored across multiple facilities and devices.

### Considerations

1. **Access Time:** Retrieval from S3 Glacier is not instantaneous; consider access requirements when choosing this storage option.
2. **Lifecycle Management:** Properly configure lifecycle policies to ensure data is automatically moved to Glacier at the appropriate time.

## Why the Project Team Must Configure Archiving and Retention

1. **Compliance:** Many industries are subject to regulatory requirements that mandate how long data must be retained. Proper archiving and retention ensure compliance with these laws and avoid legal repercussions.
2. **Cost Management:** Storing large volumes of data in high-cost storage solutions can be expensive. By archiving older or less frequently accessed documents to cost-effective storage solutions like S3 Glacier, organizations can significantly reduce their storage costs.
3. **Operational Efficiency:** Automated archiving and retention streamline data management processes, reducing the manual workload and potential for human error. This leads to more efficient operations and better resource utilization.
4. **Data Integrity and Availability:** Implementing proper archiving and retention ensures that documents are preserved and accessible for future needs, such as audits, compliance checks, or historical analysis. It also helps in managing storage growth and maintaining system performance.
5. **Data Governance:** Establishing clear policies for data retention and archiving helps in enforcing data governance principles. This includes maintaining data quality, ensuring data security, and managing data lifecycle effectively.

## Configuration Recommendations
### General Best Practices

1. **Transition After:** 30 days is a common practice for documents that are no longer actively accessed but still need to be retained. This balances cost with the need to preserve data for potential future access.
2. **Expiration After:** 365 days is a reasonable timeframe for automatically deleting documents that are no longer needed. However, this can vary based on industry requirements and the nature of the documents. For example:
    1. **Healthcare Data:** May require longer retention due to regulations (e.g., HIPAA in the US).
    2. **Financial Records:** Might also need longer retention periods.
3. **Regulatory Compliance:** Ensure the retention and deletion policies comply with industry-specific regulations and standards. For instance, healthcare and financial data often have specific retention requirements.
4. **Access Patterns:** Review access patterns to adjust the transition timing. If some documents are accessed more frequently, a shorter period before transitioning to Glacier might be appropriate.
5. **Legal Holds:** Implement mechanisms to prevent deletion if there are legal holds or compliance requirements. This helps in case documents are subject to litigation or investigation.
6. **Data Classification:** Consider classifying documents based on their importance and apply different lifecycle rules for different types.
7. **Cost Optimization:** Regularly review and adjust your lifecycle policies to ensure they are cost-effective and aligned with your data management strategy.

### Rejected Documents

For documents rejected by a verification team, the retention and expiration policies in a production environment should balance between compliance, storage costs, and practical business needs. Here's a recommended configuration based on real-world practices:

1. **Immediate Transition to Glacier or Deep Archive Storage:** Rejected documents often don't need to be accessed frequently. Transition them to a lower-cost storage class soon after rejection.
2. **Expiration and Deletion - Shorter Retention Period:** Since these documents are rejected, they may not need to be retained as long as accepted ones. Common practices include:
    1. **Retention Period:** 90 to 180 days. This period allows for any necessary review or audits before final deletion. Adjust based on regulatory requirements and business needs.
    2. **Expiration After:** Automatically delete documents after the retention period. This helps manage storage costs and ensures that outdated or irrelevant data is cleaned up.

### Expired Documents Recommendations

For expired documents, the management strategy should focus on efficient data cleanup, cost control, and compliance with any relevant policies. Here’s a recommended approach based on real-world practices:

1. **Immediate Deletion:** Set up lifecycle rules to automatically delete expired documents. This ensures that outdated or irrelevant data is removed without manual intervention.
2. **Archiving Before Deletion (Optional):** If documents need to be retained for a certain period before deletion (e.g., for auditing purposes), you can transition them to a low-cost storage class like S3 Glacier before deletion. This approach is less common for expired documents but might be used if there are specific compliance requirements.

## Associated Cost

S3 lifecycle rules can contribute to the cost of using Amazon S3, but they are designed to help manage costs by optimizing storage and reducing manual management overhead. Here’s how lifecycle rules can impact costs:

### Storage Class Transitions

1. **Archival Storage:** Transitioning objects to lower-cost storage classes like S3 Glacier or S3 Glacier Deep Archive can significantly reduce storage costs. However, there may be costs associated with the transition itself, such as PUT requests for the transition or retrieval fees when accessing archived data.
2. **Transition Costs:** While the cost of moving objects to a different storage class is generally low, there are additional costs for data retrieval, especially from archival storage classes.

### Expiration and Deletion

1. **Automatic Deletion:** Lifecycle rules that delete objects after a certain period help avoid unnecessary storage costs by removing data that is no longer needed. This prevents the accumulation of obsolete data that would otherwise incur ongoing storage costs.
2. **Request Costs:** Deleting objects involves S3 DELETE requests, which are generally low-cost but can add up if you have a large number of objects being deleted.

### Management and Retrieval Costs

1. **Management Overhead:** Lifecycle rules automate the management of your data, reducing the need for manual intervention. This can lead to cost savings in terms of operational overhead.
2. **Retrieval Fees:** When objects are stored in archival classes, there are costs associated with retrieving them, which can be higher than retrieving objects from standard or infrequent access classes.

### Additional Considerations

1. **Rule Complexity:** Complex lifecycle rules with multiple transitions and expiration actions can result in more operations and potentially higher costs. It’s important to balance complexity with cost efficiency.
2. **Frequent Transitions:** If objects frequently transition between storage classes, the associated costs can accumulate. Ensure that your transition policies align with your data access patterns to optimize costs.

## Implementation details

See S3 lifecycle configuration in [this file](https://github.com/daria-serkova/aws-cdk/blob/main/documents-services/documents-management-solution/lib/resources/s3.ts).

![PlantUML Diagram](./s3-lifecycle-configuration.plantuml)