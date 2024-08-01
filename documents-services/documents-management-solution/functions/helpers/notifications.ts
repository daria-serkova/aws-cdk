// Supported email templates for document upload notifications
const SupportedEmailTemplates = {
    DOCUMENT_UPLOAD_OWNER_NOTIFICATION: 'dms-document-uploaded-confirmation',
    DOCUMENT_UPLOAD_VERIFICATION_TEAM_NOTIFICATION: 'dms-document-uploaded-notification',
};

/**
 * Generates a list of document upload notification objects.
 * @param recipient - The email address of the recipient of the owner notification.
 * @param recipientName - The name of the document owner.
 * @param initiatorSystemCode - The code of the system initiating the notification.
 * @param metadata - Metadata related to the document upload.
 * @param notificationRecipient - The email address of the recipient of the verification team notification.
 * @returns An array of notification objects.
 */
export const getDocumentUploadNotifications = (
    recipient: string, 
    recipientName: string, 
    initiatorSystemCode: string,
    metadata: any,
    notificationRecipient: string
) => {
    const locale = 'en-IN'; // Default locale for notifications

    // Common data for notifications
    const commonData = {
        documentCategory: metadata.documentCategory,
        initiatorSystemCode
    };

    return [
        {
            templateId: SupportedEmailTemplates.DOCUMENT_UPLOAD_OWNER_NOTIFICATION, 
            locale, 
            recipient, // Recipient of the owner notification
            emailData: {
                recipientName, // Name of the document owner
                ...commonData // Spread common data into emailData
            }
        },
        {
            templateId: SupportedEmailTemplates.DOCUMENT_UPLOAD_VERIFICATION_TEAM_NOTIFICATION, 
            locale, 
            recipient: notificationRecipient, // Recipient of the verification team notification
            emailData: {
                documentId: metadata.documentId, // ID of the document
                documentOwnerId: metadata.documentOwnerId, // ID of the document owner
                ...commonData // Spread common data into emailData
            }
        }
    ];
};
