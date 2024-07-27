import * as nodemailer from 'nodemailer';
import SimpleTextEmailTemplate from './simple-text-email-template';
import { render } from "@react-email/render"; 

// Function to replace placeholders with actual data
export const renderStaticStringWithDynamicData = (text: string, data: Record<string, any>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return data[key] || '';
    });
};


export const generateEmailHtml = (subject: string, content: string, footerDetails: {
  helpText: string,
  companyName: string,
  logo: string,
  copyright: string,
  address: string,
  socilalLinks: {
    facebookUrl: string,
    twitterUrl: string,
    linkedinUrl: string,
    instagramUrl: string
  }
}): string => render(SimpleTextEmailTemplate(subject, content, footerDetails));

export const EmailAttachments = [
    {
      filename: "logo.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/logo.png`,
      cid: "logoImage", //same cid value as in the html img src
    },
    {
      filename: "x.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/x.png`,
      cid: "xIcon", //same cid value as in the html img src
    },
    {
      filename: "youtube.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/youtube.png`,
      cid: "youtubeIcon", //same cid value as in the html img src
    },
    {
      filename: "linkedinIcon.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/linkdin.png`,
      cid: "linkedinIcon", //same cid value as in the html img src
    },
    {
      filename: "instagram.png",
      path: `${process.env.EMAILS_MEDIA_PATH}/instagram.png`,
      cid: "instagramIcon", //same cid value as in the html img src
    },
  ]

export async function sendEmail(emailTo: string, subject: string, emailHtml: string) {
    const transporterSettings = {
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT || "465", 10),
        secure: Boolean(process.env.EMAIL_SMTP_IS_SECURE),
        auth: {
          user: process.env.EMAIL_SMTP_USERNAME,
          pass: process.env.EMAIL_SMTP_PASSWORD,
        },
        //debug: true, // Enable debug output
        //logger: true // Log information to console
    };
    const transporter = nodemailer.createTransport(transporterSettings);
    // Setup email data with unicode symbols
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: emailTo,
        subject: subject,
        html: emailHtml,
        attachments: EmailAttachments,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
