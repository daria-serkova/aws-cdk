# User Account Management: Supported Audit Events

Effective user account management is essential for maintaining security, compliance, and operational integrity within any organization. This includes tracking and auditing all significant actions related to user accounts. Here’s a comprehensive list of events that are typically sent from such a service to an audit log (and supported out-of-the-box in this service).

| # | Event Type | Description |
|----------|----------|----------|
|1|USER_ACCOUNT_CREATION_ATTEMPT|Logs when an attempt is made to create a new user account, whether successful or not. This helps in tracking failed account creation attempts, which could indicate potential issues or unauthorized attempts.|
|2|USER_ACCOUNT_CREATED|Indicates the creation of a new user account.|
|3|USER_ACCOUNT_ACTIVATED| Indicates that a previously inactive or newly created user account has been activated. This is important for tracking when a user first gains access to the system.|
|4|USER_ACCOUNT_SUSPENDED|Logs when a user account is temporarily suspended, often due to security concerns, policy violations, or other administrative actions.|
|5|USER_ACCOUNT_REACTIVATED|Indicates that a previously suspended user account has been reactivated, restoring the user's access to the system.|
|6|USER_ACCOUNT_LOCKED|Logs when a user account is locked due to multiple failed login attempts or other security triggers. This event is crucial for security monitoring.|
|7|USER_ACCOUNT_UNLOCKED|Indicates that a locked user account has been unlocked, typically after additional verification or administrative intervention.|
|8|USER_ACCOUNT_DELETED|Indicates the deletion or deactivation of a user account.|
|9|ROLE_ASSIGNED|Indicates the assignment of a role or privilege to a user.|
|10|ROLE_REMOVED|Indicates that a role or privilege has been removed from a user. This is important for tracking changes in user access and permissions.|
|11|USER_ACCOUNT_PRIVILEGES_ESCALATED|Logs when a user's privileges are escalated, such as being granted admin rights. This event is critical for monitoring potential insider threats or unauthorized privilege escalation.|
|12|USER_ACCOUNT_PRIVILEGES_REVOKED|Indicates that certain privileges or roles have been revoked from a user, often as part of a security measure or policy enforcement.|
|13|USER_PROFILE_UPDATED|Logs when a user updates their profile information, such as changing their email address, phone number, or other personal details. This event is useful for tracking changes in user data.|