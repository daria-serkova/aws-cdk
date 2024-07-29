import * as nodemailer from 'nodemailer';
import { render } from "@react-email/render";
import UploadDocumentConfirmationEmailTemplate from './email-templates/upload-document-confirmation';
import { EmailAttachments, EmailTypes } from './configs';
import UploadDocumentNotificationEmailTemplate from './email-templates/UploadDocumentNotificationEmailTemplate';

// Configuration settings for the email transporter
const transporterSettings = {
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || "465", 10),
  secure: Boolean(process.env.EMAIL_SMTP_IS_SECURE),
  auth: {
    user: process.env.EMAIL_SMTP_USERNAME,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(transporterSettings);

// Company details used in the email templates
const companyDetails = {
  companyName: "Documents Management Solutions",
  platformHelpCenterUrl: "https://www.company.com/help",
  supportEmail: "support@company.com",
  startYear: 2024,
  address: "123 Address, City, State, USA - 123456",
  facebookUrl: "https://www.facebook.com/yourpage",
  twitterUrl: "https://twitter.com/yourpage",
  linkedinUrl: "https://www.linkedin.com/yourpage",
  instagramUrl: "https://instagram.com/yourpage",
};

// Calculate the copyright year string
const currentYear = new Date().getFullYear();
const copyrightYear = currentYear === companyDetails.startYear
  ? `${companyDetails.startYear}`
  : `${companyDetails.startYear} - ${currentYear}`;

/**
 * Generate email HTML content based on the email type and details.
 * @param emailType - Type of the email to be sent.
 * @param emailDetails - Additional details required for the email template.
 * @returns HTML content for the email.
 */
const generateEmailHtml = (emailType: string, emailDetails: any): string => {
  switch (emailType) {
    case EmailTypes.DOCUMENT_UPLOADED_CONFIRMATION:
      return render(
        UploadDocumentConfirmationEmailTemplate({
          ...companyDetails,
          year: copyrightYear,
          documentName: emailDetails.documentName,
          confirmationNumber: emailDetails.confirmationNumber,
          name: emailDetails.emailDetails
        })
      );
    case EmailTypes.DOCUMENT_UPLOADED_NOTIFICATION:
      return render(
        UploadDocumentNotificationEmailTemplate({
          ...companyDetails,
          year: copyrightYear
        })
      );
    default:
      return '';
  }
};
/**
 * Get the subject line for the email based on the email type.
 * @param emailType - Type of the email to be sent.
 * @returns Subject line for the email.
 */
const getSubject = (emailType: string, dynamicData: string): string => {
  switch (emailType) {
    case EmailTypes.DOCUMENT_UPLOADED_CONFIRMATION:
      return 'Confirmation of Document Submission';
    case EmailTypes.DOCUMENT_UPLOADED_NOTIFICATION:
      return `New Document Submitted by ${dynamicData}`
      default:
      return '';
  }
};
/**
 * Send an email to the specified recipient with the given email type and details.
 * @param emailTo - Recipient's email address.
 * @param name - Recipient's name.
 * @param emailType - Type of the email to be sent.
 * @param emailDetails - Additional details required for the email template.
 */
export async function sendEmail(
  emailTo: string,
  emailType: string,
  emailDetails: any,
  subjectDynamicData: string,
) {
  // Generate the email HTML content and subject based on the email type
  const emailHtml = generateEmailHtml(emailType, emailDetails);
  const subject = getSubject(emailType, subjectDynamicData);

  // Send the email using the Nodemailer transporter
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: emailTo,
    subject: subject,
    html: emailHtml,
    attachments: EmailAttachments,
  });
}
