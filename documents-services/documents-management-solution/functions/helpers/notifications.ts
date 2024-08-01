
const SupportedEmailTemplates = {
    DOCUMENT_UPLOAD_OWNER_NOTIFICATION: 'dms-document-uploaded-confirmation',
    DOCUMENT_UPLOAD_VERIFICATION_TEAM_NOTIFICATION: 'dms-document-uploaded-notification',
}
export const getDocumentUploadNotifications = (
        recipient: string, 
        recipientName: string, 
        initiatorSystemCode: string,
        metadata: any,
        notificationRecipient: string) => {
        const locale = 'en-IN';
    return [
    {
        templateId: SupportedEmailTemplates.DOCUMENT_UPLOAD_OWNER_NOTIFICATION, 
        locale, 
        recipient,
        emailData: {
            recipientName,
            documentCategory: metadata.documentCategory,
        }, 
        initiatorSystemCode
    },
    {
        templateId: SupportedEmailTemplates.DOCUMENT_UPLOAD_VERIFICATION_TEAM_NOTIFICATION, 
        locale, 
        recipient: notificationRecipient,
        emailData: {
            documentId: metadata.documentId,
            documentOwnerId: metadata.documentOwnerId,
            documentCategory: metadata.documentCategory,
        }, 
        initiatorSystemCode
    },
  ]
}
