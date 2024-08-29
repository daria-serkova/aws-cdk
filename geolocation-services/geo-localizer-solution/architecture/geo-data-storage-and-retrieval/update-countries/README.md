# Process: Update Country Data from GeoNames

The Update Country Data process is a crucial component of the data management framework designed to efficiently retrieve and store comprehensive country information from the [GeoNames Country Info API](https://www.geonames.org/export/web-services.html#countryInfo). This process focuses specifically on updating the country data within the DynamoDB table, ensuring that the system has accurate and up-to-date information about countries.

The process involves fetching country data in multiple supported languages, which is then organized and stored in the DynamoDB table. This ensures a reliable, scalable, and multilingual repository of country information, enabling seamless access and integration across various applications. The process is integral to maintaining the accuracy and relevance of country-specific data in the system.

## Components View

![Components View](#)

## API Details

### Overview
This endpoint is designed for use when an organization needs to update country data in the system. Since country information does not change frequently, updates are rare and typically occur only when there are significant changes or additions.

Lists of countries and languages, which data should be copied to organization's database from GeoNames are configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).

### API Endpoint

{{API_GATEWAY_URL}}/geo/country/update

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

No request model validation is expected for this API endpoint as no parameters or request body are used for it.

### API Request Format

The API endpoint does not require any parameters or request body.

### API Response Format

Sample of the response from AWS service:
```
{
    "message": "Country information updated successfully"
}
```
### API Limitations

If the list of supported countries is extensive, the API Gateway request may encounter a 'Timeout' response due to the processing time, which can take several minutes. The maximum allowed timeout configuration for API Gateway is 29 seconds. You can monitor the status of the execution through the CloudWatch Log Group. Successful executions will log the result for review for long time running operations.