## Overview

This repository contains the code for a serverless email service built on AWS. The service is designed to handle various email-related tasks, including:

1. Sending personalized emails
2. Managing email templates
3. Tracking email delivery 

By leveraging AWS's serverless architecture, this solution ensures high availability, scalability, and cost-efficiency.

## Benefits

1. Scalability: Automatically scales with the volume of emails, ensuring smooth operation without manual intervention.
2. Cost-Efficiency: Pay only for what you use, reducing costs associated with idle infrastructure.
3. High Availability: AWS's reliable infrastructure guarantees minimal downtime and high availability.
4. Flexibility: Easily customize email templates and content to fit various business needs.
5. Security: Built-in security features ensure data privacy and compliance with industry standards.
6. Integration: Seamlessly integrates with other AWS services and third-party applications.

## Technology Stack

The following technologies are used in this solution:

- **AWS CloudFormation / AWS CDK:** Infrastructure as Code (IaC) for deploying the solution.
- **TypeScript:** Programming language.
- **Node.js:** The runtime environment for executing TypeScript code on AWS Lambda.
- **AWS API Gateway:** Provides RESTful APIs to interact with the email service.
- **AWS Lambda:** Executes the backend code for handling email-related tasks without provisioning or managing servers.
- **Amazon S3:** Stores email templates and media files, used in the emails.
- **Amazon DynamoDB:** A NoSQL database for storing email logs and metadata.
- **Amazon CloudWatch:** Monitors and logs the performance and health of the email services.
- **AWS IAM:** Ensures secure access control and permissions for resources.
- **Nodemailer:** Manages the sending, receiving, and delivery of emails.
- **ReactJS and Tailwind**: Branded emails UI (including libraries @react-email/components and @react-email/tailwind)

## Workflows
TBD location with diagrams and documentation

## Architecture
TBD location with diagrams and documentation

## API
TBD location with Postman collection and environments

## Getting Started

1. **Prerequisites**
   - AWS Account
   - AWS CLI configured
   - Node.js installed
   - AWS CDK installed

2. **Deployment**
   - Clone the repository:
     ```sh
     git clone https://github.com/daria-serkova/aws-cdk.git
     cd email-services/emails-management-solution
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Deploy the stack using CDK:
     ```sh
     cdk deploy
     ```

3. **Usage**
   - Configure the solution according to your specific project needs.
   - Use the provided APIs and dashboards to manage emails.

## Contributions

Contributions are welcome! Please submit issues and pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.