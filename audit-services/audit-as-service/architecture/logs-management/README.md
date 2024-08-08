# Overview

For an Audit as a Service implementation, having a well-organized CloudWatch Logs group structure is crucial to ensure logs are easily searchable, accessible, and manageable. Below is a recommended structure for CloudWatch Logs groups, tailored for an Audit as a Service architecture.

## Logs Organization

Log groups are organized based on:

1. Environment
2. Data Type (such as providers, insurance, billing)
3. Audited Entity (such as Documents, Profile, etc)
4. Specific audit actions (such as Upload, Access, Metadata Access, etc)
5. Regulations (such as HIPAA, PII, PCI-DSS)

![PlantUML Diagram]()