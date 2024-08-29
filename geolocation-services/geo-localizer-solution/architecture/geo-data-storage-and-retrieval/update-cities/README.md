# Process: Update City Data from GeoNames

The Update City Data process is a key component of the data management framework, designed to efficiently retrieve and store detailed city information from the [GeoNames Search JSON API](https://www.geonames.org/export/geonames-search.html). This process specifically focuses on updating city data within the DynamoDB table, ensuring that the system maintains accurate and up-to-date information about cities globally.

The process involves fetching city data in multiple supported languages, which is then organized and stored in the DynamoDB table. This method guarantees a reliable, scalable, and multilingual repository of city information, facilitating seamless access and integration across various applications. Maintaining accurate and current city-specific data is crucial for supporting a wide range of functionalities that depend on up-to-date geographical information.

## Process

![Components View](#)

## API Details

### Overview

This endpoint is designed for use when an organization needs to update city data in the system. Given that city information can change over time, updates are conducted as needed to ensure that the system reflects accurate and current details about cities worldwide.

Lists of countries, states and languages, which city data should be copied to the organization's database from GeoNames, are configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).


### API Endpoint

```
{{API_GATEWAY_URL}}/geo/city/update-list
```

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![API Validation](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/architecture/geo-data-storage-and-retrieval/update-cities/request-validation.svg)

List of supported countries for body parameter value, is configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).

### API Request Format
Body format (for update of the cities for all states within country):
```
{
    "countryCode": "US",
    "stateCode": "*"
}
```
Body format (for update of the cities for specified state within country):
```
{
    "countryCode": "US",
    "stateCode": "PA"
}
```

### API Response Format

Sample of the response from AWS service:
```
{
    "message": "City information updated successfully"
}
```

### API Limitations

If update is requested for all states within the country, the API Gateway request may encounter a 'Timeout' response due to the processing time, which can take several minutes. The maximum allowed timeout configuration for API Gateway is 29 seconds. You can monitor the status of the execution through the CloudWatch Log Group. Successful executions will log the result for review for long time running operations.