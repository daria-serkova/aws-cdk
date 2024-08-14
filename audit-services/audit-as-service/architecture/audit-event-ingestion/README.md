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

This audit service supports following types of audit events out of the box. All additional events need to be added by project team before starting to send ingestion requests to Audit Service.

### 1. User Access
#### 1.1. OTP (One-Time Password)

| Event Type | Description |
|----------|----------|
| OTP_GENERATED | Indicates that an OTP code was generated for a user action (e.g., registration, login, password change). **NOTE:** When you send this request, you have to record auditId next to OTP valye as audit of OTP_VALIDATION_SUCCESS and OTP_VALIDATION_FAILED will require to add reference of this event as a part of it’s payload.|
| OTP_SENT | Indicates that the generated OTP code was sent to the user's email / phone. |
| OTP_VALIDATION_SUCCESS | Indicates that the OTP code was successfully validated by the user. |
| OTP_VALIDATION_FAILED | Indicates that the OTP code validation failed (e.g., incorrect OTP entered).|

#### 1.2. Login
| Event Type | Description |
|----------|----------|
|LOGIN_ATTEMPT|Logs every login attempt, regardless of success or failure. This is useful for tracking all access attempts and can be correlated with other events like LOGIN_SUCCESSFUL and LOGIN_FAILED.|
|LOGIN_SUCCESSFUL | Indicates a successful login to systems.|
|LOGIN_FAILED | Indicates a failed login attempt.|
|MULTIPLE_LOGIN_FAILED | Indicates multiple consecutive failed login attempts.|
|UNUSUAL_LOGIN_LOCATION| Logs when a login is detected from an unusual or new location, often flagged for security review.|

#### 1.3. Logout
| Event Type | Description |
|----------|----------|
|LOGOUT_ATTEMPT|Captures when a user initiates a logout request. This helps in correlating with LOGOUT_SUCCESSFUL or LOGOUT_UNSUCCESSFUL events to track the entire logout process.|
|LOGOUT_SUCCESSFUL|Indicates that a user successfully logged out of the system.|
|LOGOUT_UNSUCCESSFUL|Logs when a logout attempt fails, which can be a security risk if the session is not properly terminated.|
|FORCED_LOGOUT|Logs when a user is forcibly logged out by the system, which could occur due to an admin action, security policy enforcement, or the detection of suspicious activity.|

#### 1.4. Session Management
| Event Type | Description |
|----------|----------|
|SESSION_CREATION_ATTEMPT|Logs when an attempt is made to create a session, whether successful or not. This helps in tracking failed session creation attempts, which could indicate issues like system errors or unauthorized access attempts.|
|SESSION_CREATED|Logs when a session is successfully created after a successful login, useful for session management and tracking user activity.|
|SESSION_TERMINATED|Indicates when a user manually logs out or when a session is terminated, either by the user or the system (e.g., due to inactivity).|
|SESSION_REFRESH|Indicates that the session has been successfully refreshed due to user activity.|
|SESSION_EXPIRED|Indicates that a session has expired due to inactivity and the user has been automatically logged out.|
|SESSION_RESTORED|Indicates when a session is restored from a previous state, such as after a page reload or browser restart. This is important for tracking continuity in user activity.|

#### 1.5. Password Management
| Event Type | Description |
|----------|----------|
|PASSWORD_CHANGE_REQUESTED|Indicates a start of password reset request.|
|PASSWORD_CHANGE_SUCCESSFULL|Indicates a successful change of a user password.|
|PASSWORD_CHANGE_FAILED|Indicates a failed attempt to change a user password.|
|PASSWORD_CHANGE_EMAIL_SENT|Indicates that an email with password recovery instructions has been sent to the user. This helps track whether the recovery process was communicated effectively.|
|PASSWORD_EXPIRATION_WARNING|Logs when a user is notified that their password is about to expire, prompting them to change it before it becomes invalid.|
|PASSWORD_EXPIRED|Indicates that a user's password has expired, and they are required to change it before logging in again. This is important for enforcing password policies.|
|PASSWORD_REUSE_ATTEMPT| Logs when a user attempts to reuse a previous password that has been disallowed by the system's password policy.|
|PASSWORD_POLICY_VIOLATION|Indicates that a password change or creation attempt violated the system's password policy (e.g., not meeting complexity requirements).|

### 2. User Account Management

| Event Type | Description |
|----------|----------|
|USER_ACCOUNT_CREATION_ATTEMPT|Logs when an attempt is made to create a new user account, whether successful or not. This helps in tracking failed account creation attempts, which could indicate potential issues or unauthorized attempts.|
|USER_ACCOUNT_CREATED|Indicates the creation of a new user account.|
|USER_ACCOUNT_ACTIVATED| Indicates that a previously inactive or newly created user account has been activated. This is important for tracking when a user first gains access to the system.|
|USER_ACCOUNT_SUSPENDED|Logs when a user account is temporarily suspended, often due to security concerns, policy violations, or other administrative actions.|
|USER_ACCOUNT_REACTIVATED|Indicates that a previously suspended user account has been reactivated, restoring the user's access to the system.|
|USER_ACCOUNT_LOCKED|Logs when a user account is locked due to multiple failed login attempts or other security triggers. This event is crucial for security monitoring.|
|USER_ACCOUNT_UNLOCKED|Indicates that a locked user account has been unlocked, typically after additional verification or administrative intervention.|
|USER_ACCOUNT_DELETED|Indicates the deletion or deactivation of a user account.|
|ROLE_ASSIGNED|Indicates the assignment of a role or privilege to a user.|
|ROLE_REMOVED|Indicates that a role or privilege has been removed from a user. This is important for tracking changes in user access and permissions.|
|USER_ACCOUNT_PRIVILEGES_ESCALATED|Logs when a user's privileges are escalated, such as being granted admin rights. This event is critical for monitoring potential insider threats or unauthorized privilege escalation.|
|USER_ACCOUNT_PRIVILEGES_REVOKED|Indicates that certain privileges or roles have been revoked from a user, often as part of a security measure or policy enforcement.|
|USER_PROFILE_UPDATED|Logs when a user updates their profile information, such as changing their email address, phone number, or other personal details. This event is useful for tracking changes in user data.|

### 3. Documents Management

In a large-scale production environment, especially one dealing with sensitive data like Personally Identifiable Information (PII), Protected Health Information (PHI), and Payment Card Information (PCI), a Document Management Service must maintain a comprehensive audit trail. This trail should cover all significant actions related to document creation, access, modification, and deletion. Here’s a comprehensive list of events that are typically sent from such a service to an audit log (and supported out-of-the-box in this service).

#### 3.1. Document Lifecycle Events

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

#### 3.2. Document Access Control Events

| Event Type | Description |
|----------|----------|
|||

#### 3.3. Document Compliance and Security Events

| Event Type | Description |
|----------|----------|
|||

#### 3.4. Document Collaboration and Workflow Events

| Event Type | Description |
|----------|----------|
|||


#### Importance of These Events
1. **Security:** Events like DOCUMENT_ENCRYPTION_APPLIED, DOCUMENT_INTEGRITY_FAILED, and DOCUMENT_REDACTED help ensure that sensitive information is protected throughout its lifecycle.
2. **Compliance:** Events such as DOCUMENT_RETENTION_POLICY_APPLIED, DOCUMENT_LEGAL_HOLD_APPLIED, and DOCUMENT_AUDIT_LOG_CREATED are critical for meeting regulatory requirements and maintaining audit trails.
Transparency: Tracking events like DOCUMENT_VIEWED, DOCUMENT_DOWNLOADED, and DOCUMENT_MODIFIED ensures that all actions on sensitive documents are visible and traceable.
3. **Collaboration:** Events like DOCUMENT_CHECKED_OUT, DOCUMENT_WORKFLOW_STARTED, and DOCUMENT_COMMENT_ADDED support collaborative work environments by tracking document interactions.

List is configured inside file `aws-cdk/audit-services/audit-as-service/helpers/utils.ts` (SupportedEventTypes)

Allowed attributes for different type of audit events also configured on the API Request Model side: `aws-cdk/audit-services/audit-as-service/lib/resources/api-gateway.ts` (auditStoreEventsEndpoin -> requestModel)


## Event Collection Mechanisms

## Event Transformation & Normalization