# Audit Event Ingestion
Audit Event Ingestion is the foundational process within an Audit As a Service (AaaS) solution that captures and records events from various systems, applications, and services within an organization. This process ensures that all relevant activities and transactions are logged in a structured and consistent manner, enabling comprehensive auditing, monitoring, and compliance management.

# Key Components

## Event Sources

Event sources represent the various systems, applications, and services from which audit events are collected within an organization. These sources can vary widely depending on the organization's technology stack and operational needs. 

The file `aws-cdk/audit-services/audit-as-service/helpers/utils.ts` (SupportedInitiatorSystemCodes) is used to configure and manage the supported event sources. It ensures that each event includes the appropriate initiatorSystemCode value to accurately identify the source of the event. This configuration file is critical for maintaining consistency and traceability of audit events across different systems and services. By defining these sources and their corresponding initiatorSystemCode values, organizations can ensure that their audit logs are comprehensive, reliable, and traceable back to the originating systems. This facilitates better monitoring, compliance, and analysis of organizational activities.

Sample of supported event sources:

1. Document Management (WEB)
2. Document Management (Mobile App)
3. Billing System (WEB)
4. Customer Support System (WEB)
5. Customer Relationship Management (CRM) System (WEB)
6. Enterprise Resource Planning (ERP) System (WEB)
4. etc...

Project team will need to add their source application to the supported list before starting to send ingestion requests to Audit Service.

## Events Types

This audit service supports following types of audit events out of the box. All additional events need to be added by project team before starting to send ingestion requests to Audit Service.

### User Access
#### OTP (One-Time Password)

| Event Type | Description |
|----------|----------|
| OTP_GENERATED | Indicates that an OTP code was generated for a user action (e.g., registration, login, password change). **NOTE:** When you send this request, you have to record auditId next to OTP valye as audit of OTP_VALIDATION_SUCCESS and OTP_VALIDATION_FAILED will require to add reference of this event as a part of it’s payload.|
| OTP_SENT | Indicates that the generated OTP code was sent to the user's email / phone. |
| OTP_VALIDATION_SUCCESS | Indicates that the OTP code was successfully validated by the user. |
| OTP_VALIDATION_FAILED | Indicates that the OTP code validation failed (e.g., incorrect OTP entered).|

#### Login
| Event Type | Description |
|----------|----------|
|LOGIN_ATTEMPT|Logs every login attempt, regardless of success or failure. This is useful for tracking all access attempts and can be correlated with other events like LOGIN_SUCCESSFUL and LOGIN_FAILED.|
|LOGIN_SUCCESSFUL | Indicates a successful login to systems.|
|LOGIN_FAILED | Indicates a failed login attempt.|
|MULTIPLE_LOGIN_FAILED | Indicates multiple consecutive failed login attempts.|
|UNUSUAL_LOGIN_LOCATION| Logs when a login is detected from an unusual or new location, often flagged for security review.|

#### Logout
| Event Type | Description |
|----------|----------|
|LOGOUT_ATTEMPT|Captures when a user initiates a logout request. This helps in correlating with LOGOUT_SUCCESSFUL or LOGOUT_UNSUCCESSFUL events to track the entire logout process.|
|LOGOUT_SUCCESSFUL|Indicates that a user successfully logged out of the system.|
|LOGOUT_UNSUCCESSFUL|Logs when a logout attempt fails, which can be a security risk if the session is not properly terminated.|
|FORCED_LOGOUT|Logs when a user is forcibly logged out by the system, which could occur due to an admin action, security policy enforcement, or the detection of suspicious activity.|

#### Session Management
| Event Type | Description |
|----------|----------|
|SESSION_CREATION_ATTEMPT|Logs when an attempt is made to create a session, whether successful or not. This helps in tracking failed session creation attempts, which could indicate issues like system errors or unauthorized access attempts.|
|SESSION_CREATED|Logs when a session is successfully created after a successful login, useful for session management and tracking user activity.|
|SESSION_TERMINATED|Indicates when a user manually logs out or when a session is terminated, either by the user or the system (e.g., due to inactivity).|
|SESSION_REFRESH|Indicates that the session has been successfully refreshed due to user activity.|
|SESSION_EXPIRED|Indicates that a session has expired due to inactivity and the user has been automatically logged out.|
|SESSION_RESTORED|Indicates when a session is restored from a previous state, such as after a page reload or browser restart. This is important for tracking continuity in user activity.|

#### Password Management

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

### User Account Management

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

#### Documents Management

| Event Type | Description |
|----------|----------|
|||

List is configured inside file `aws-cdk/audit-services/audit-as-service/helpers/utils.ts` (SupportedEventTypes)

Allowed attributes for different type of audit events also configured on the API Request Model side: `aws-cdk/audit-services/audit-as-service/lib/resources/api-gateway.ts` (auditStoreEventsEndpoin -> requestModel)


## Event Collection Mechanisms

## Event Transformation & Normalization