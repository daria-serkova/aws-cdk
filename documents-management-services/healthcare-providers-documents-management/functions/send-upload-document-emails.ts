import { EmailTypes } from "./helpers/configs";
import { sendEmail } from "./helpers/email-helper";

export const handler = async (event: any): Promise<any> => {
    const { email } = event;
    await sendEmail(email, EmailTypes.DOCUMENT_UPLOADED_CONFIRMATION, event);
};