# Process: Update Country Data from GeoNames

The Update Country Data process is a crucial component of the data management framework designed to efficiently retrieve and store comprehensive country information from the [GeoNames Country Info API](https://www.geonames.org/export/web-services.html#countryInfo). This process focuses specifically on updating the country data within the DynamoDB table, ensuring that the system has accurate and up-to-date information about countries.

The process involves fetching country data in multiple supported languages, which is then organized and stored in the DynamoDB table. This ensures a reliable, scalable, and multilingual repository of country information, enabling seamless access and integration across various applications. The process is integral to maintaining the accuracy and relevance of country-specific data in the system.

## Components View

![Components View](#)

## API Details

This endpoint is designed for use when an organization needs to update country data in the system. Since country information does not change frequently, updates are rare and typically occur only when there are significant changes or additions.

List of supported countries and languages are configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts)

- **API endpoint:** {{API_GATEWAY_URL}}/geo-data/update-countries
- **API supported methods:** POST
- **API authorization:** Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

No request model validation is expected for this API endpoint.

### API Request Format

The API endpoint does not require any parameters or request body.

### API Response Format

Sample of the response from AWS service with S3 pre-signed urls per each document:
```
{
    "message": "Country information updated successfully"
}
```