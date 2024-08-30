# Process: Get Localized City Dropdown Values

The Get Localized City Dropdown Values process is a key component within the data access layer, designed to provide applications with an efficient and reliable method to retrieve a list of cities stored inside the organization's data layer. This process is essential for functionalities that require accurate and up-to-date city information, such as regional configurations, city-specific services, and localization.

This API endpoint retrieves the list of cities in the language specified in the request, ensuring that the information is relevant and understandable to the user. By organizing and accessing the data from the database, the process guarantees prompt and precise retrieval of city data. This is crucial for applications that require a multilingual repository of city information, enabling seamless integration and access across various services.

## Process

![Components View](#)

## API Details

### Overview

The Get Localized Cities Dropdown Values API is designed to streamline the retrieval of cities information in the format {label: '', value: ''}, making it ideal for scenarios where global applications require accurate and localized cities data. 

### API Endpoint

```
{{API_GATEWAY_URL}}/geo/city/get-dropdown-values
```

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![API Validation](request-validation.svg)

Lists of supported languages and countryCodes for body parameter value, are configured in the [Utilities file](./../../../helpers/utilities.ts).

### API Request Format

Body format:
```
{
    "language": "en",
    "countryCode": "US",
    "stateCode": "PA"
}
```

### API Response Format

Sample of the response from AWS service (English):
```
```