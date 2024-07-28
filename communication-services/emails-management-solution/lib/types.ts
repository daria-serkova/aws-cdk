/**
 * Schema for Email Log, that will be stored in the DynamoDB database upon each email submission
 */
export interface EmailLog {
    emailId: string // Unique identifier for each email.
    recipient: string // Email address of the recipient.
    subject: string // Subject line of the email.
    body: string // path to email body sent to the user.
    template: string // Identifier for the email template used.
    deliveryStatus: string // delivery status of the email (e.g., SENT, FAILED).
    timestamp: string // The date and time when the email was sent.
    metadata: any // Additional metadata such as tags or campaign information.
    errorDetails: any // Details of any errors encountered during sending.
}