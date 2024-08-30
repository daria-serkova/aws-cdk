# Process: Get States List

The Get States List process is a crucial component of the data access layer, designed to retrieve a list of states stored in DynamoDB. This process provides applications with efficient access to up-to-date state information, which is essential for various functionalities such as regional configurations, state-specific services, and localization.

This API endpoint retrieves the list of states in the language specified in the request. The information is organized and accessed from the DynamoDB table, ensuring prompt and accurate retrieval of state data. This process is vital for applications that need a multilingual repository of state information, facilitating smooth integration and access across diverse services.

## Process

![Components View](#)

## API Details

### Overview

This endpoint is used to retrieve a list of states from the system’s DynamoDB table. The API allows specifying the language in which the state names should be returned, supporting internationalization and localization efforts.

### API Endpoint

```
{{API_GATEWAY_URL}}/geo/state/get-list
```

### API Supported Methods

POST

### API Authorization

Security header X-API-Key (generated API Gateway key) is required.

### API Request Model Validation

API endpoint conducts following validation checks on the request's body before routing it for processing.

![API Validation](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/architecture/geo-data-storage-and-retrieval/retrieve-states/request-validation.svg)

Lists of supported languages and countryCodes for body parameter value, are configured in the [Utilities file](https://github.com/daria-serkova/aws-cdk/blob/main/geolocation-services/geo-localizer-solution/helpers/utilities.ts).

### API Request Format

Body format:
```
{
    "language": "en",
    "countryCode": "US"
}
```

### API Response Format

Sample of the response from AWS service:
```
[
    {
        "value": "AL",
        "label": "Alabama"
    },
    {
        "value": "AK",
        "label": "Alaska"
    },
    {
        "value": "AZ",
        "label": "Arizona"
    },
    {
        "value": "AR",
        "label": "Arkansas"
    },
    {
        "value": "CA",
        "label": "California"
    },
    {
        "value": "CO",
        "label": "Colorado"
    },
    {
        "value": "CT",
        "label": "Connecticut"
    },
    {
        "value": "DE",
        "label": "Delaware"
    },
    {
        "value": "DC",
        "label": "District of Columbia"
    },
    {
        "value": "FL",
        "label": "Florida"
    },
    {
        "value": "GA",
        "label": "Georgia"
    },
    {
        "value": "HI",
        "label": "Hawaii"
    },
    {
        "value": "ID",
        "label": "Idaho"
    },
    {
        "value": "IL",
        "label": "Illinois"
    },
    {
        "value": "IN",
        "label": "Indiana"
    },
    {
        "value": "IA",
        "label": "Iowa"
    },
    {
        "value": "KS",
        "label": "Kansas"
    },
    {
        "value": "KY",
        "label": "Kentucky"
    },
    {
        "value": "LA",
        "label": "Louisiana"
    },
    {
        "value": "ME",
        "label": "Maine"
    },
    {
        "value": "MD",
        "label": "Maryland"
    },
    {
        "value": "MA",
        "label": "Massachusetts"
    },
    {
        "value": "MI",
        "label": "Michigan"
    },
    {
        "value": "MN",
        "label": "Minnesota"
    },
    {
        "value": "MS",
        "label": "Mississippi"
    },
    {
        "value": "MO",
        "label": "Missouri"
    },
    {
        "value": "MT",
        "label": "Montana"
    },
    {
        "value": "NE",
        "label": "Nebraska"
    },
    {
        "value": "NV",
        "label": "Nevada"
    },
    {
        "value": "NH",
        "label": "New Hampshire"
    },
    {
        "value": "NJ",
        "label": "New Jersey"
    },
    {
        "value": "NM",
        "label": "New Mexico"
    },
    {
        "value": "NY",
        "label": "New York"
    },
    {
        "value": "NC",
        "label": "North Carolina"
    },
    {
        "value": "ND",
        "label": "North Dakota"
    },
    {
        "value": "OH",
        "label": "Ohio"
    },
    {
        "value": "OK",
        "label": "Oklahoma"
    },
    {
        "value": "OR",
        "label": "Oregon"
    },
    {
        "value": "PA",
        "label": "Pennsylvania"
    },
    {
        "value": "RI",
        "label": "Rhode Island"
    },
    {
        "value": "SC",
        "label": "South Carolina"
    },
    {
        "value": "SD",
        "label": "South Dakota"
    },
    {
        "value": "TN",
        "label": "Tennessee"
    },
    {
        "value": "TX",
        "label": "Texas"
    },
    {
        "value": "UT",
        "label": "Utah"
    },
    {
        "value": "VT",
        "label": "Vermont"
    },
    {
        "value": "VA",
        "label": "Virginia"
    },
    {
        "value": "WA",
        "label": "Washington"
    },
    {
        "value": "WV",
        "label": "West Virginia"
    },
    {
        "value": "WI",
        "label": "Wisconsin"
    },
    {
        "value": "WY",
        "label": "Wyoming"
    }
]
```