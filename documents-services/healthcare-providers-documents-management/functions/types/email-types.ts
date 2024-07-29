
/**
 * Information about organization, that must be passed to each branded email 
 * to be displayed in the header and footer.
 */
 export interface EmailPropsType {
    subject?: string;
    companyDetails: {
      companyName: string;
      address: string;
      contactEmail: string;
      year: string;
      helpPageLink: string;
      youtubeUrl: string;
      twitterUrl: string;
      linkedinUrl: string;
      instagramUrl: string;
    }
  }
  /**
   * Information about uploaded document, that must be passed to confirmation email.
   */
  export interface UploadDocumentConfirmationEmailPropsType extends EmailPropsType {
    userName: string;
    documentType: string;
    confirmationNumber: string;
  }
  
  /**
   * Information about uploaded document, that must be passed to notification email.
   */
   export interface UploadDocumentNotificationEmailPropsType extends EmailPropsType {
    userName: string;
    documentType: string;
    documentAccessPath: string;
  }