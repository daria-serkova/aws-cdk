import fetch from 'node-fetch'; 

const EMS_SERVICE_URL = process.env.EMS_SERVICE_URL!;
const EMS_SERVICE_TOKEN = process.env.EMS_SERVICE_TOKEN!;

export interface EmailNotification {
    templateId: string;
    locale: string; 
    recipient: string;
    emailData: object;
    initiatorSystemCode: string
}
/**
 * Lambda function handler for uploading a document to an S3 bucket.
 * The function processes a document object, which is expected to be passed in the event payload in the base64-encoded format.
 *
 * @param event - The input event containing the document object to be uploaded.
 * @returns - An object containing document metadata object
 * @throws - Throws an error if the upload fails, with the error message or 'Internal Server Error' as the default.
 */
 export const handler = async (event: any): Promise<any> => {
    const notifications: EmailNotification[] = event.notifications;

    try {
        for (let index = 0; index < notifications.length; index++) {
          const notification = notifications[index];
          const response = await fetch(`${EMS_SERVICE_URL}/delivery/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': EMS_SERVICE_TOKEN,
            },
            body: JSON.stringify(notification),
        });
  
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Notifications sent successfully',
            }),
        };
    } catch (error) {
        console.error('Error sending notifications:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Internal Server Error',
            }),
        };
    }
}

/**
 * Sends a notification to the EMS service.
 *
 * @param notification - The notification object to be sent.
 * @returns - A promise that resolves when the fetch operation completes.
 */
const fetchNotification = async (notification: EmailNotification): Promise<void> => {
    const response = await fetch(`${EMS_SERVICE_URL}/delivery/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': EMS_SERVICE_TOKEN,
        },
        body: JSON.stringify(notification),
    });

    if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
    }
};
