import { Firehose } from 'aws-sdk';
import { ResourceName } from '../lib/resource-reference';
const firehose = new Firehose({ region: process.env.REGION });

export const sendEvent = async () => {
    const record = {
        Data: JSON.stringify({
            initiatorsystemcode: "ABC_DE_WEB",
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
        DeliveryStreamName: ResourceName.auditDataStream,
        Record: record,
    };

    try {
        const result = await firehose.putRecord(params).promise();
        console.log('Record added to Firehose:', result);
    } catch (err) {
        console.error('Error adding record to Firehose:', err);
    }
}