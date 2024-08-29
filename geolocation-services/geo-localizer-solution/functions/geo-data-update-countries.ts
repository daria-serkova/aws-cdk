import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ResourceName } from '../lib/resource-reference';
import { getCurrentTime, SupportedCountries, SupportedLanguages } from '../helpers/utilities';

const table = ResourceName.dynamoDb.GEO_DATA_COUNTRIES_TABLE;
const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
const countriesParams = SupportedCountries.map(country => `country=${encodeURIComponent(country)}`).join('&');
const geoNamesUrl = `http://api.geonames.org/countryInfoJSON?username=${process.env.GEONAMES_USERNAME}&lang=$1&${countriesParams}`;

interface Country {
    countryCode: string;
    countryName: string;
    geonameId: number;
}
interface GeoNamesResponse<T> {
    geonames?: T[];
}

exports.handler = async () => {
    try {
        const fetchCountriesPromises = SupportedLanguages.map(async (language) => {
            const url = geoNamesUrl.replace('$1', language);
            const response = await fetch(url);
            const data: GeoNamesResponse<Country> = await response.json();
            if (!data.geonames || !data.geonames.length) {
                console.warn(`No data found for language ${language}`);
                return [];
            }
            return data.geonames.map((country) => ({
                countryCode: country.countryCode,
                countryName: country.countryName,
                geonameId: country.geonameId,
                language: language
            }));
        });

        // Wait for all fetch operations to complete
        const countriesResults = await Promise.all(fetchCountriesPromises);

        // Aggregate country names by geonameId
        const updatedAt = getCurrentTime();
        const countriesMap = countriesResults.flat().reduce((acc, country) => {
            if (!acc[country.geonameId]) {
                acc[country.geonameId] = {
                    geonameId: country.geonameId,
                    countryCode: country.countryCode,
                    ...Object.fromEntries(SupportedLanguages.map(lang => [lang, ''])),
                    updatedAt
                };
            }
            acc[country.geonameId][country.language] = country.countryName;
            return acc;
        }, {} as Record<number, any>);

        // Create DynamoDB write operations for countries
        const writeCountriesPromises = Object.values(countriesMap).map(country => {
            const entry = {
                TableName: table,
                Item: marshall(country),
            };

            return dynamoDb.send(new PutItemCommand(entry));
        });

        // Wait for all DynamoDB write operations to complete for countries
        await Promise.all(writeCountriesPromises);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Country information updated successfully' }),
        };
    } catch (error) {
        console.error('Error fetching or storing country info:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch or store country information' }),
        };
    }
};
