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
        "geonameId": 4829764,
        "stateCode": "AL",
        "name": "Alabama"
    },
    {
        "geonameId": 5879092,
        "stateCode": "AK",
        "name": "Alaska"
    },
    {
        "geonameId": 5551752,
        "stateCode": "AZ",
        "name": "Arizona"
    },
    {
        "geonameId": 4099753,
        "stateCode": "AR",
        "name": "Arkansas"
    },
    {
        "geonameId": 5332921,
        "stateCode": "CA",
        "name": "California"
    },
    {
        "geonameId": 5417618,
        "stateCode": "CO",
        "name": "Colorado"
    },
    {
        "geonameId": 4831725,
        "stateCode": "CT",
        "name": "Connecticut"
    },
    {
        "geonameId": 4142224,
        "stateCode": "DE",
        "name": "Delaware"
    },
    {
        "geonameId": 4138106,
        "stateCode": "DC",
        "name": "District of Columbia"
    },
    {
        "geonameId": 4155751,
        "stateCode": "FL",
        "name": "Florida"
    },
    {
        "geonameId": 4197000,
        "stateCode": "GA",
        "name": "Georgia"
    },
    {
        "geonameId": 5855797,
        "stateCode": "HI",
        "name": "Hawaii"
    },
    {
        "geonameId": 5596512,
        "stateCode": "ID",
        "name": "Idaho"
    },
    {
        "geonameId": 4896861,
        "stateCode": "IL",
        "name": "Illinois"
    },
    {
        "geonameId": 4921868,
        "stateCode": "IN",
        "name": "Indiana"
    },
    {
        "geonameId": 4862182,
        "stateCode": "IA",
        "name": "Iowa"
    },
    {
        "geonameId": 4273857,
        "stateCode": "KS",
        "name": "Kansas"
    },
    {
        "geonameId": 6254925,
        "stateCode": "KY",
        "name": "Kentucky"
    },
    {
        "geonameId": 4331987,
        "stateCode": "LA",
        "name": "Louisiana"
    },
    {
        "geonameId": 4971068,
        "stateCode": "ME",
        "name": "Maine"
    },
    {
        "geonameId": 4361885,
        "stateCode": "MD",
        "name": "Maryland"
    },
    {
        "geonameId": 6254926,
        "stateCode": "MA",
        "name": "Massachusetts"
    },
    {
        "geonameId": 5001836,
        "stateCode": "MI",
        "name": "Michigan"
    },
    {
        "geonameId": 5037779,
        "stateCode": "MN",
        "name": "Minnesota"
    },
    {
        "geonameId": 4436296,
        "stateCode": "MS",
        "name": "Mississippi"
    },
    {
        "geonameId": 4398678,
        "stateCode": "MO",
        "name": "Missouri"
    },
    {
        "geonameId": 5667009,
        "stateCode": "MT",
        "name": "Montana"
    },
    {
        "geonameId": 5073708,
        "stateCode": "NE",
        "name": "Nebraska"
    },
    {
        "geonameId": 5509151,
        "stateCode": "NV",
        "name": "Nevada"
    },
    {
        "geonameId": 5090174,
        "stateCode": "NH",
        "name": "New Hampshire"
    },
    {
        "geonameId": 5101760,
        "stateCode": "NJ",
        "name": "New Jersey"
    },
    {
        "geonameId": 5481136,
        "stateCode": "NM",
        "name": "New Mexico"
    },
    {
        "geonameId": 5128638,
        "stateCode": "NY",
        "name": "New York"
    },
    {
        "geonameId": 4482348,
        "stateCode": "NC",
        "name": "North Carolina"
    },
    {
        "geonameId": 5690763,
        "stateCode": "ND",
        "name": "North Dakota"
    },
    {
        "geonameId": 5165418,
        "stateCode": "OH",
        "name": "Ohio"
    },
    {
        "geonameId": 4544379,
        "stateCode": "OK",
        "name": "Oklahoma"
    },
    {
        "geonameId": 5744337,
        "stateCode": "OR",
        "name": "Oregon"
    },
    {
        "geonameId": 6254927,
        "stateCode": "PA",
        "name": "Pennsylvania"
    },
    {
        "geonameId": 5224323,
        "stateCode": "RI",
        "name": "Rhode Island"
    },
    {
        "geonameId": 4597040,
        "stateCode": "SC",
        "name": "South Carolina"
    },
    {
        "geonameId": 5769223,
        "stateCode": "SD",
        "name": "South Dakota"
    },
    {
        "geonameId": 4662168,
        "stateCode": "TN",
        "name": "Tennessee"
    },
    {
        "geonameId": 4736286,
        "stateCode": "TX",
        "name": "Texas"
    },
    {
        "geonameId": 5549030,
        "stateCode": "UT",
        "name": "Utah"
    },
    {
        "geonameId": 5242283,
        "stateCode": "VT",
        "name": "Vermont"
    },
    {
        "geonameId": 6254928,
        "stateCode": "VA",
        "name": "Virginia"
    },
    {
        "geonameId": 5815135,
        "stateCode": "WA",
        "name": "Washington"
    },
    {
        "geonameId": 4826850,
        "stateCode": "WV",
        "name": "West Virginia"
    },
    {
        "geonameId": 5279468,
        "stateCode": "WI",
        "name": "Wisconsin"
    },
    {
        "geonameId": 5843591,
        "stateCode": "WY",
        "name": "Wyoming"
    }
]
```