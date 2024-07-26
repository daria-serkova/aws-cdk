import * as nodemailer from 'nodemailer';

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



const generateEmailHtml = (template: any, data: any): string => {
    return ''
}