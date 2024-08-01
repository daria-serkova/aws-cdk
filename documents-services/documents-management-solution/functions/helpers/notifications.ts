export const getDocumentUploadNotifications = (
        recipient: string, 
        recipientName: string, 
        documentCategory: string,
        initiatorSystemCode: string) => {
        const locale = 'en-IN';
    return [
    {
        templateId: "dms-document-uploaded-confirmation", 
        locale, 
        recipient,
        emailData: {
            recipientName,
            documentCategory: documentCategory.toLowerCase(),
        }, 
        initiatorSystemCode
    },
    {
        templateId: "dms-document-uploaded-confirmation", 
        locale, 
        recipient,
        emailData: {
            recipientName,
            documentCategory: documentCategory.toLowerCase(),
        }, 
        initiatorSystemCode
    },
  ]
}
