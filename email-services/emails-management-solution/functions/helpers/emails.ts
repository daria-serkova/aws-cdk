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

// Function to replace placeholders with actual data
export const renderMarkdownWithData = (markdown: string, data: Record<string, any>): string => {
    return markdown.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return data[key] || '';
    });
};
// Function to replace placeholders with actual data
const renderHtmlWithData = (html: string, data: Record<string, any>): string => {
    return html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return data[key] || '';
    });
};


const generateEmailHtml = (template: any, data: any): string => {
    return ''
}