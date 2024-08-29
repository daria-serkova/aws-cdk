# Process: Update State Data from GeoNames

The Update State Data process is an essential part of the data management framework, designed to efficiently retrieve and store comprehensive state information from the [GeoNames Children JSON API](https://www.geonames.org/export/place-hierarchy.html). This process is specifically focused on updating state data within the DynamoDB table, ensuring that the system maintains accurate and up-to-date information about states and regions within countries.

The process involves fetching state data in multiple supported languages, which is then organized and stored in the DynamoDB table. This approach ensures a reliable, scalable, and multilingual repository of state information, enabling seamless access and integration across various applications. The process is critical to maintaining the accuracy and relevance of state-specific data within the system, supporting a wide range of functionalities that rely on up-to-date geographical information.

## Process

![Components View](#)

## API Details

### Overview
This endpoint is designed for use when an organization needs to update state data in the system. Since state information can occasionally change, updates are performed as needed to ensure that the system reflects accurate and current information about states and regions.

Lists of countries and languages, which state data should be copied to the organization's database from GeoNames, are configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).


### API Endpoint

```
{{API_GATEWAY_URL}}/geo/state/update-list
```

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![API Validation](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/architecture/geo-data-storage-and-retrieval/update-states/request-validation.svg)

List of supported countries for body parameter value, is configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).

### API Request Format
Body format:
```
{
    "countryCode": "US"
}
```

### API Response Format

Sample of the response from AWS service:
```
{
    "message": "States information updated successfully"
}
```

### API Limitations

If the list of supported countries is extensive, the API Gateway request may encounter a 'Timeout' response due to the processing time, which can take several minutes. The maximum allowed timeout configuration for API Gateway is 29 seconds. You can monitor the status of the execution through the CloudWatch Log Group. Successful executions will log the result for review for long time running operations.