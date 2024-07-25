import { Service } from "aws-sdk";
import { EmailTypes } from "./helpers/configs";
import { getEmailTemplate } from "./helpers/email-helper";

export const handler = async (event: any): Promise<any> => {
    const { type, email, name, documentName, confirmationNumber } = event;
    await getEmailTemplate(email.toLowerCase(), name, type, { documentName, confirmationNumber});
};