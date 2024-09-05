# Supported Audit Events: User Access

Managing user access effectively is critical for maintaining security and ensuring that users have appropriate permissions to perform their roles. Here’s a comprehensive list of events that are typically sent from such a service to an audit log (and supported out-of-the-box in this service).

## OTP (One-Time Password)

| Event Type | Description | Event Format |
|----------|----------|----------|
| OTP_GENERATED | Indicates that an OTP code was generated for a user action (e.g., registration, login, password change). **NOTE:** When you send this request, you have to record auditId next to OTP value as audit of OTP_VALIDATION_SUCCESS and OTP_VALIDATION_FAILED will require to add reference of this event as a part of it’s payload.|[event](./supported-events/OTP_GENERATED.json)|
| OTP_SENT | Indicates that the generated OTP code was sent to the user's email / phone. |[event](./supported-events/OTP_SENT.json)|
| OTP_VALIDATION_SUCCESS | Indicates that the OTP code was successfully validated by the user. |[event](./supported-events/OTP_VALIDATION_SUCCESS.json)|
| OTP_VALIDATION_FAILED | Indicates that the OTP code validation failed (e.g., incorrect OTP entered).|[event](./supported-events/OTP_VALIDATION_FAILED.json)|

## Login
| Event Type | Description | Event Format |
|----------|----------|----------|
|LOGIN_ATTEMPT|Logs every login attempt, regardless of success or failure. This is useful for tracking all access attempts and can be correlated with other events like LOGIN_SUCCESSFUL and LOGIN_FAILED.|[event](./supported-events/LOGIN_ATTEMPT.json)|
|LOGIN_SUCCESSFUL | Indicates a successful login to systems.|[event](./supported-events/LOGIN_SUCCESSFUL.json)|
|LOGIN_FAILED | Indicates a failed login attempt.|[event](./supported-events/LOGIN_FAILED.json)|
|MULTIPLE_LOGIN_FAILED | Indicates multiple consecutive failed login attempts.|[event](./supported-events/MULTIPLE_LOGIN_FAILED.json)|
|UNUSUAL_LOGIN_LOCATION| Logs when a login is detected from an unusual or new location, often flagged for security review.|[event](./supported-events/UNUSUAL_LOGIN_LOCATION.json)|

## Logout
| Event Type | Description | Event Format |
|----------|----------|----------|
|LOGOUT_ATTEMPT|Captures when a user initiates a logout request. This helps in correlating with LOGOUT_SUCCESSFUL or LOGOUT_UNSUCCESSFUL events to track the entire logout process.|
|LOGOUT_SUCCESSFUL|Indicates that a user successfully logged out of the system.|
|LOGOUT_UNSUCCESSFUL|Logs when a logout attempt fails, which can be a security risk if the session is not properly terminated.|
|FORCED_LOGOUT|Logs when a user is forcibly logged out by the system, which could occur due to an admin action, security policy enforcement, or the detection of suspicious activity.|

## Session Management
| Event Type | Description | Event Format |
|----------|----------|----------|
|SESSION_CREATION_ATTEMPT|Logs when an attempt is made to create a session, whether successful or not. This helps in tracking failed session creation attempts, which could indicate issues like system errors or unauthorized access attempts.|
|SESSION_CREATED|Logs when a session is successfully created after a successful login, useful for session management and tracking user activity.|
|SESSION_TERMINATED|Indicates when a user manually logs out or when a session is terminated, either by the user or the system (e.g., due to inactivity).|
|SESSION_REFRESH|Indicates that the session has been successfully refreshed due to user activity.|
|SESSION_EXPIRED|Indicates that a session has expired due to inactivity and the user has been automatically logged out.|
|SESSION_RESTORED|Indicates when a session is restored from a previous state, such as after a page reload or browser restart. This is important for tracking continuity in user activity.|

## Password Management
| Event Type | Description | Event Format |
|----------|----------|----------|
|PASSWORD_CHANGE_REQUESTED|Indicates a start of password reset request.|
|PASSWORD_CHANGE_SUCCESSFULL|Indicates a successful change of a user password.|
|PASSWORD_CHANGE_FAILED|Indicates a failed attempt to change a user password.|
|PASSWORD_CHANGE_EMAIL_SENT|Indicates that an email with password recovery instructions has been sent to the user. This helps track whether the recovery process was communicated effectively.|
|PASSWORD_EXPIRATION_WARNING|Logs when a user is notified that their password is about to expire, prompting them to change it before it becomes invalid.|
|PASSWORD_EXPIRED|Indicates that a user's password has expired, and they are required to change it before logging in again. This is important for enforcing password policies.|
|PASSWORD_REUSE_ATTEMPT| Logs when a user attempts to reuse a previous password that has been disallowed by the system's password policy.|
|PASSWORD_POLICY_VIOLATION|Indicates that a password change or creation attempt violated the system's password policy (e.g., not meeting complexity requirements).|
