import { config } from 'dotenv';
config(); 
// Pattern for API Gateway models' names to keep consistency across all application resources.
const AWS_REQUEST_MODEL_NAMING_CONVENTION : string  = `${process.env.TAG_APPLICATION_CODE?.replace(/-/g, "")}`;
// Pattern for resources names to keep consistency across all application resources.
const AWS_RESOURCES_NAMING_CONVENTION : string = `${process.env.AWS_RESOURCES_NAME_PREFIX}-${process.env.TAG_ENVIRONMENT}-$`;

/**
 * Function is used to generate standardized resource names by appending
 * appropriate prefixes or suffixes to the base resource names.
 * @param name - unique AWS resource name
 * @returns string with organization's prefix and unique resource name
 */
const resourceName = (name: string) : string => AWS_RESOURCES_NAMING_CONVENTION.replace('$', name);

/**
 * File is used for exporting resource names to be passed between AWS resource definitions during creation.
 */
export const ResourceName = {
    cloudWatch: {
        LOGS_GROUP: resourceName('geo-localizer-log-group'), 
    },
    dynamoDb: {
        GEO_DATA_COUNTRIES_TABLE: resourceName('geo-data-countries'),
        GEO_DATA_STATES_TABLE: resourceName('geo-data-states'),
        GEO_DATA_CITIES_TABLE: resourceName('geo-data-cities'), 

        GEO_DATA_INDEX_COUNTRY_CODE: resourceName('geo-data-index-country-code'), 
    },
    iam: {
        LAMBDA_UPDATE_GEO_DATA_COUNTRIES: resourceName('geo-data-update-countries-lbd-role'), 
        LAMBDA_UPDATE_GEO_DATA_STATES: resourceName('geo-data-update-states-lbd-role'),
        LAMBDA_UPDATE_GEO_DATA_CITIES: resourceName('geo-data-update-cities-lbd-role'),

        LAMBDA_GET_GEO_DATA_COUNTRIES: resourceName('geo-data-get-countries-lbd-role'), 
        LAMBDA_GET_GEO_DATA_STATES: resourceName('geo-data-get-states-lbd-role'),
        LAMBDA_GET_GEO_DATA_CITIES: resourceName('geo-data-get-cities-lbd-role'),
        
    },
    lambda: {
        LAMBDA_UPDATE_GEO_DATA_COUNTRIES: resourceName('geo-data-update-countries-lbd'), 
        LAMBDA_UPDATE_GEO_DATA_STATES: resourceName('geo-data-update-states-lbd'),
        LAMBDA_UPDATE_GEO_DATA_CITIES: resourceName('geo-data-update-cities-lbd'),
        
        LAMBDA_GET_GEO_DATA_COUNTRIES: resourceName('geo-data-get-countries-lbd'), 
        LAMBDA_GET_GEO_DATA_STATES: resourceName('geo-data-get-states-lbd'),
        LAMBDA_GET_GEO_DATA_CITIES: resourceName('geo-data-get-cities-lbd'),
    },
    apiGateway: {
        API_GATEWAY: resourceName('documents-api'),
        API_USAGE_PLAN: resourceName('documents-api-usage-plan'),
        API_KEY: resourceName('documents-api-key'),
        API_REQUEST_VALIDATOR: resourceName('documents-api-request-validator'),
        
        REQUEST_MODEL_GEO_DATA_UPDATE: `${AWS_REQUEST_MODEL_NAMING_CONVENTION}GeoDataUpdate`,
    },
}