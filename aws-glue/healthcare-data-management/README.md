# Overview

AWS Glue is a fully managed ETL (Extract, Transform, Load) service that makes it easy to prepare and load data for analytics. Project contains sample of the AWS CDK code for business scenario "Healthcare Data Management", where recommending AWS Glue makes sense from an architecture standpoint. AWS Glue is used for following activities:

1. Integrating and transforming data from various healthcare systems (e.g., EHRs, billing systems) for analytics.
2. Ensuring data privacy and security while preparing data for analysis and reporting.

# How to run script

1. Clone this repository to local machine
2. Copy file `sample-env.txt` into `.env` file
3. Via terminal: execute command `aws configure`. Provide credentials for AWS account, where resources should be created.
4. Via terminal: execute command `cdk synth`.
5. Via terminal: execute command `cdk deploy`.
6. Navigate to AWS console and validate that your resources are created and has accurate settings.