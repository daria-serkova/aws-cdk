import { 
    FirehoseTransformationEvent, 
    FirehoseTransformationResult, 
    FirehoseTransformationHandler,
    FirehoseTransformationResultRecord
} from 'aws-lambda';
import { validateAuditEvent } from '../helpers/utils';

/**
 * AWS Lambda function to transform Firehose Audit Events records.
 * 
 * This Lambda function is triggered by Amazon Kinesis Firehose to process incoming records.
 * It performs the following tasks:
 * 1. Decodes base64-encoded data from the incoming records.
 * 2. Parses the JSON data and validates it against a predefined schema. If validation failed - event will be stored in errors destination
 * 3. Extracts specific fields from the JSON payload to be used as partition keys.
 * 4. Transforms the JSON payload and re-encodes it in base64 format.
 * 5. Adds metadata to each record containing partition keys for further processing by Firehose.
 * 
 * @param event - The event object containing records to process. It includes:
 *   - records: An array of records to be transformed. Each record contains:
 *     - data: The base64-encoded data of the record.
 *     - recordId: A unique identifier for the record.
 * 
 * @returns A Promise that resolves to an object containing the transformed records. Each record includes:
 *   - recordId: The unique identifier of the record.
 *   - result: The processing result of the record. Can be:
 *     - 'Ok': Indicates successful processing.
 *     - 'ProcessingFailed': Indicates processing failure.
 *   - data: The base64-encoded data of the transformed record, or the original data if processing failed.
 *   - metadata (optional): Contains partition keys if the record is processed successfully.
 * 
 * @example
 * // Example of transformed record:
 * {
 *   recordId: '12345',
 *   result: 'Ok',
 *   data: 'base64-encoded-transformed-data',
 *   metadata: {
 *     partitionKeys: {
 *       initiatorsystemcode: 'CRM-WEB',
 *       eventtype: 'LOGIN_FAILED',
 *       year: 'year=2023',
 *       month: 'month=8',
 *       day: 'day=15'
 *     }
 *   }
 * }
 */

export const handler: FirehoseTransformationHandler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    const transformedRecords: FirehoseTransformationResultRecord[] = event.records.map(record => {
        const payload = Buffer.from(record.data, 'base64').toString('utf-8');
        let jsonPayload;
        try {
            jsonPayload = JSON.parse(payload);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return {
                recordId: record.recordId,
                result: 'ProcessingFailed',
                data: record.data,
            };
        }
        const validation = validateAuditEvent(jsonPayload);
        if (!validation.isValid) {
            console.error('Audit Event validation failed:', validation.errors);
            return {
                recordId: record.recordId,
                result: 'ProcessingFailed',
                data: record.data,
            };
        }
        // Extract partition keys' values
        const initiatorsystemcode = jsonPayload.initiatorsystemcode;
        const eventtype = jsonPayload.eventtype;
        const timestamp = jsonPayload.timestamp;

        const eventDate = new Date(parseInt(timestamp, 10));
        const year = `year=${eventDate.getFullYear()}`;
        const month = `month=${eventDate.getMonth() + 1}`;
        const day = `day=${eventDate.getDate()}`;

        // Convert the transformed payload back to a string
        const transformedData = JSON.stringify(jsonPayload);

        // Encode the transformed payload back to base64
        const transformedBase64Data = Buffer.from(transformedData).toString('base64');  

        return {
            recordId: record.recordId,
            result: 'Ok',
            data: transformedBase64Data,
            metadata: {
                partitionKeys: {
                    initiatorsystemcode,
                    eventtype,
                    year,
                    month,
                    day
                }
            }
        }; 
    });
    return { records: transformedRecords };
};
