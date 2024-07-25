import * as nodemailer from 'nodemailer';
import { render } from "@react-email/render";
import UploadDocumentConfirmationEmailTemplate from './email-templates/upload-document-confirmation';
import { EmailAttachments, EmailTypes } from './configs';

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

const companyDetails = {
  companyName: "Documents Management Solutions",
  platformHelpCenterUrl: "https://www.dariaserkova.com/help",
  supportEmail: "support@dariaserkova.com",
  startYear: 2024,
  address: "Address 123, City, State - 123456",
  facebookUrl: "https://www.facebook.com/yourpage",
  twitterUrl: "https://twitter.com/yourpage",
  linkedinUrl: "https://www.linkedin.com/yourpage",
  instagramUrl: "https://instagram.com/yourpage",
};
const currentYear = new Date().getFullYear();
const copyrightYear =
  currentYear === companyDetails.startYear
    ? `${companyDetails.startYear}`
    : `${companyDetails.startYear} - ${currentYear}`;

export async function getEmailTemplate(
  emailTo: string,
  name: string,
  emailType: string,
  emailDetails: any
) {
  let emailHtml = '';
  let subject = '';
  switch (emailType) {
    case EmailTypes.DOCUMENT_UPLOADED:
      emailHtml = render(
        UploadDocumentConfirmationEmailTemplate({
          name: name,
          companyName: companyDetails.companyName,
          address: companyDetails.address,
          supportEmail: companyDetails.supportEmail,
          year: copyrightYear,
          helpPageLink: companyDetails.platformHelpCenterUrl,
          youtubeUrl: companyDetails.facebookUrl,
          twitterUrl: companyDetails.twitterUrl,
          linkedinUrl: companyDetails.linkedinUrl,
          instagramUrl: companyDetails.instagramUrl,
          documentName: emailDetails.documentName,
          confirmationNumber: emailDetails.confirmationNumber,
        })
      );
      subject = "Document Management Solutions: Document Uploaded";
      break;
    default:
      break;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: emailTo,
    subject: subject,
    html: emailHtml,
    attachments: EmailAttachments
  });
}