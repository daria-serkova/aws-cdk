# Documents Management: Supported Audit Events

In a large-scale production environment, especially one dealing with sensitive data like Personally Identifiable Information (PII), Protected Health Information (PHI), and Payment Card Information (PCI), a Document Management Service must maintain a comprehensive audit trail. This trail should cover all significant actions related to document creation, access, modification, and deletion. Here’s a comprehensive list of events that are typically sent from such a service to an audit log (and supported out-of-the-box in this service).

## Document Lifecycle Events

|#| Event Type | Description |
|----------|----------|----------|
|1|DOCUMENT_UPLOAD_INITIATED|Indicates that the process of uploading a document has begun. This event includes metadata about the document and the user who initiated the upload.|
|2|DOCUMENT_UPLOAD_COMPLETED|Indicates that a document has been successfully uploaded to the system. This event includes metadata such as document type, size, and the user who uploaded it.|
|3|DOCUMENT_UPLOAD_FAILED|Logs when an attempt to upload a document fails. This event could be triggered by errors such as network issues, file format issues, or authorization failures.|
|4|DOCUMENT_METADATA_CREATED| Indicates that metadata for a document has been created. This event is crucial for tracking the association of metadata with documents.|
|5|DOCUMENT_METADATA_UPDATED|Logs when metadata for a document is modified.|
|6|DOCUMENT_METADATA_DELETED|Indicates that the metadata associated with a document has been deleted. This might be part of a broader document deletion process or an isolated action.|
|7|DOCUMENT_CONTENT_VIEWED| Logs when a document is accessed or viewed by a user. This event helps in tracking who has accessed potentially sensitive information.|
|8|DOCUMENT_METADATA_VIEWED| Logs when a document's metadata is accessed or viewed by a user. This event helps in tracking who has accessed potentially sensitive information.|
|9|DOCUMENT_DOWNLOADED|Indicates that a document has been downloaded by a user. This is critical for monitoring the distribution of sensitive data.|
|10|DOCUMENT_MODIFIED|Logs when a document has been modified. This includes any changes to the document's content or structure.|
|11|DOCUMENT_DELETION_REQUESTED|Indicates that a user has requested to delete a document. This event precedes the actual deletion, allowing for audit and potential review before the document is removed.|
|12|DOCUMENT_DELETED|Logs the permanent deletion of a document from the system. This event is crucial for ensuring that sensitive data is properly disposed of.|
|13|DOCUMENT_ARCHIVED|Indicates that a document has been archived, often as part of a retention policy. This event ensures that the document is no longer active but retained for compliance reasons.|
|14|DOCUMENT_RESTORED|Logs when a document has been restored from an archived state, making it active again. This event is important for tracking the lifecycle of documents over time.|
|15|DOCUMENT_REDACTION_REQUESTED|Indicates that a request has been made to redact sensitive information from a document. This is especially important in the context of PII, PHI, or PCI data.|
|16|DOCUMENT_REDACTED|Logs when sensitive information has been successfully redacted from a document. This ensures that only non-sensitive data is accessible going forward.|

## Document Access Control Events

|#| Event Type | Description |
|----------|----------|----------|
|1|DOCUMENT_ACCESS_GRANTED|Indicates that access to a document has been granted to a user or group. This event tracks changes in who can view or modify the document.|
|2|DOCUMENT_ACCESS_REVOKED|Logs when access to a document has been revoked. This is critical for ensuring that only authorized users have access to sensitive documents.|
|3|DOCUMENT_PERMISSIONS_CHANGED|Indicates that the permissions on a document have been altered, such as changing a user’s role from viewer to editor.|
|4|DOCUMENT_SHARING_ENABLED|Logs when a document is shared with external parties. This event is important for tracking the distribution of documents outside the organization.|
|5|DOCUMENT_SHARING_DISABLED|Indicates that external sharing of a document has been disabled, restricting access to internal users only.|

## Document Compliance and Security Events

|#| Event Type | Description |
|----------|----------|----------|
|1|DOCUMENT_INTEGRITY_CHECKED|Logs when the integrity of a document is verified, ensuring that it has not been tampered with or corrupted.|
|2|DOCUMENT_INTEGRITY_FAILED|Indicates that a document failed an integrity check, suggesting possible tampering or corruption.|

## Document Verification Workflow Events

|#| Event Type | Description |
|----------|----------|----------|
|1|VERIFICATION_REQUEST_RECEIVED|Logs when a verification request for a document is received by the system, detailing the document and the requester.|
|2|VERIFICATION_REQUEST_ASSIGNED|Indicates that a verification request has been assigned to a verification team or individual. This event helps track who is responsible for the verification.|
|3|VERIFICATION_REQUEST_IN_PROGRESS|Logs that the verification process for a document is currently underway, providing insights into the workflow status.|
|4|VERIFICATION_REQUEST_FAILED|Records any failures encountered during the verification process, such as errors or missing information.|
|5|DOCUMENT_VERIFICATION_SUCCESSFUL|Indicates that a document has successfully passed the verification process. This includes details about the verification results and any notes from the verifier.|
|6|DOCUMENT_VERIFICATION_FAILED|Logs when a document fails the verification process, providing reasons for failure and any actions taken.|
|7|DOCUMENT_VERIFICATION_PENDING| Indicates that the verification status of a document is pending, typically due to awaiting additional information or review.|


## Importance of These Events
1. **Security:** Events like DOCUMENT_ENCRYPTION_APPLIED, DOCUMENT_INTEGRITY_FAILED, and DOCUMENT_REDACTED help ensure that sensitive information is protected throughout its lifecycle.
2. **Compliance:** Events such as DOCUMENT_RETENTION_POLICY_APPLIED, DOCUMENT_LEGAL_HOLD_APPLIED, and DOCUMENT_AUDIT_LOG_CREATED are critical for meeting regulatory requirements and maintaining audit trails.
Transparency: Tracking events like DOCUMENT_VIEWED, DOCUMENT_DOWNLOADED, and DOCUMENT_MODIFIED ensures that all actions on sensitive documents are visible and traceable.
3. **Collaboration:** Events like DOCUMENT_CHECKED_OUT, DOCUMENT_WORKFLOW_STARTED, and DOCUMENT_COMMENT_ADDED support collaborative work environments by tracking document interactions.