import { Firehose } from 'aws-sdk';
const firehose = new Firehose({ region: process.env.REGION });

interface AuditEventData {
    initiatorsystemcode: string;
    eventtype: string;
    requestorid: string;
    requestorip: string;
    timestamp: string;
    devicetype: string;
    devicemodel: string;
    devicebrowsername: string;
    deviceosname: string;
    deviceosversion: string;
    
    [key: string]: any;  // To allow additional custom fields if needed
}
export const sendUploadEvent = async (event) => {

}

export const sendEvent = async (event: any) => {
    const record = {
        Data: JSON.stringify({
            initiatorsystemcode: "CRM_WEB",
            eventtype: "LOGIN_SUCCESSFUL",
            requestorid: "user123",
            requestorip: "192.168.1.10",
            timestamp: "1723261726286",
            devicetype: "mobile",
            devicemodel: "iPhone 12",
            devicebrowsername: "Safari",
            deviceosname: "iOS",
            deviceosversion: "14.4",
            loginmethod: "PASSWORD",
            sessionid: "abc123sessionid",
            sessionstarttime: "1723257726286",
            sessionexpirationtime: "1723261726286"
        }),
    };
    const params = {
        DeliveryStreamName: process.env.AUDIT_EVENTS_DATA_STREAM,
        Record: record,
    };

    try {
        const result = await firehose.putRecord(params).promise();
    } catch (err) {
        console.error('Error adding record to Firehose:', err);
    }
}

