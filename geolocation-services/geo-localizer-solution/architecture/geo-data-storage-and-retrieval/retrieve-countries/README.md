# Process: Get Countries List

The Get Countries List process is an essential part of the data access layer, designed to retrieve a list of countries stored in DynamoDB. This process enables applications to access up-to-date country information efficiently, which is crucial for various functions such as localization, country-specific configurations, and internationalization.

This API endpoint fetches the list of countries in the language specified in the request. The information is organized and retrieved from the DynamoDB table, ensuring quick and accurate access to country data. The process is vital for applications that require a multilingual repository of country information, enabling seamless integration and access across various services.

## Process

![Components View](#)

## API Details

### Overview

This endpoint is used to retrieve a list of countries from the system’s DynamoDB table. The API allows specifying the language in which the country names should be returned, supporting internationalization and localization efforts.

### API Endpoint

```
{{API_GATEWAY_URL}}/geo/country/get-list
```

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![API Validation](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/architecture/geo-data-storage-and-retrieval/retrieve-countries/request-validation.svg)

List of supported languages for body parameter value, is configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).

### API Request Format

Body format:
```
{
    "language": "en"
}
```

### API Response Format

Sample of the response from AWS service:
```
[
    {
        "geonameId": 6251999,
        "countryCode": "CA",
        "name": "Canada"
    },
    {
        "geonameId": 1269750,
        "countryCode": "IN",
        "name": "India"
    },
    {
        "geonameId": 6252001,
        "countryCode": "US",
        "name": "United States"
    }
]
```