import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { SupportedLanguages } from '../helpers/utilities';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const table = ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        // Parse the language from the request body
        const { language } = JSON.parse(event.body);

        // Validate that the language is supported
        if (!SupportedLanguages.includes(language)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Unsupported language' }),
            };
        }

        // Prepare the scan command to retrieve only the geonameId and specified language fields
        const scanCommandInput: ScanCommandInput = {
            TableName: table,
            ProjectionExpression: `geonameId, countryCode, ${language}`,
        };

        // Execute the scan command
        const scanResult = await dynamoDb.send(new ScanCommand(scanCommandInput));

        // Unmarshall the result items, replace the language key with "name", and filter out items where the locale field is not defined
        const filteredItems = (scanResult.Items || []).map(item => {
            const unmarshalledItem = unmarshall(item);
            return {
                geonameId: unmarshalledItem.geonameId,
                countryCode: unmarshalledItem.countryCode,
                name: unmarshalledItem[language],
            };
        }).filter(item => item.name !== undefined);

        // Sort the filtered items by the "name" values alphabetically
        filteredItems.sort((a, b) => {
            const valueA = a.name.toLowerCase();
            const valueB = b.name.toLowerCase();
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        });
        return {
            statusCode: 200,
            body: JSON.stringify(filteredItems),
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
