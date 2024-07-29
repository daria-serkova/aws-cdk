import { EmailTypes } from "./helpers/configs";
import { sendEmail } from "./helpers/email-helper";

const notificationEmail = process.env.NOTIFICATION_EMAIL || '';
export const handler = async (event: any): Promise<any> => {
    const { email, name } = event;
    await sendEmail(email, EmailTypes.DOCUMENT_UPLOADED_CONFIRMATION, event, '');
    await sendEmail(notificationEmail, EmailTypes.DOCUMENT_UPLOADED_NOTIFICATION, event, name);
};