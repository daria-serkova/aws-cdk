import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dotenv from "dotenv";
dotenv.config();
export const apiGatewaySettings = {
  restApiName: `${process.env.AWS_RESOURCES_NAME_PREFIX}-api-${process.env.TAG_ENVIRONMENT}`,
  description:
    "API Gateway between UI application and backend services for Documents Management Solution",
  apiVersion: "v1",
  deployOptions: {
    stageName: process.env.API_STAGE || "",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: ["POST"],
  },
  requestValidatorName: `${process.env.AWS_RESOURCES_NAME_PREFIX}-request-validator`,
  usagePlan: {
    name: `${process.env.AWS_RESOURCES_NAME_PREFIX}-usage-plan`,
    description: "Usage plan used for DMS API Gateway",
    quota: {
      limit: 10000,
      period: apigateway.Period.DAY,
    },
    throttle: {
      rateLimit: 20,
      burstLimit: 10,
    },
  },
  apiKey: {
    name: `${
      process.env.AWS_RESOURCES_NAME_PREFIX
    }-X-API-KEY-${process.env.TAG_ENVIRONMENT?.toUpperCase()}`,
    description: `API Key for DMS API Gateway (${process.env.TAG_ENVIRONMENT} environment)`,
  },
  apiResponseNames: {
    response400: `${process.env.AWS_RESOURCES_NAME_PREFIX}-ERROR-BAD-REQUEST`,
    response404: `${process.env.AWS_RESOURCES_NAME_PREFIX}-ERROR-RESOURCE-NOT-FOUND`,
    response403: `${process.env.AWS_RESOURCES_NAME_PREFIX}-ERROR-AUTH`,
    response500: `${process.env.AWS_RESOURCES_NAME_PREFIX}-ERROR-INTERNAL-SERVER`,
  },
  defaultResponseHeaders: {
    "Access-Control-Allow-Origin": "'*'",
  },
};
export function configureResources(scope: Construct) {
  var apiGateway = new apigateway.RestApi(
    scope,
    apiGatewaySettings.restApiName,
    apiGatewaySettings
  );
  apiGateway.root.addResource(apiGatewaySettings.apiVersion);
  const requestValidator = new apigateway.RequestValidator(
    scope,
    apiGatewaySettings.requestValidatorName,
    {
      restApi: apiGateway,
      requestValidatorName: apiGatewaySettings.requestValidatorName,
      validateRequestBody: true,
      validateRequestParameters: false,
    }
  );
  // Usage Plan for API keys and quotas
  const usageplan = apiGateway.addUsagePlan(apiGatewaySettings.usagePlan.name, {
    name: apiGatewaySettings.usagePlan.name,
    description: apiGatewaySettings.usagePlan.description,
    apiStages: [
      {
        api: apiGateway,
        stage: apiGateway.deploymentStage,
      },
    ],
    quota: {
      limit: apiGatewaySettings.usagePlan.quota.limit,
      period: apiGatewaySettings.usagePlan.quota.period,
    },
    throttle: {
      rateLimit: apiGatewaySettings.usagePlan.throttle.rateLimit,
      burstLimit: apiGatewaySettings.usagePlan.throttle.burstLimit,
    },
  });
  // API Key for authorization
  const apiKey = apiGateway.addApiKey(apiGatewaySettings.apiKey.name, {
    apiKeyName: apiGatewaySettings.apiKey.name,
    description: apiGatewaySettings.apiKey.description,
  });
  usageplan.addApiKey(apiKey);

  // Add a gateway response for a 400 Bad Request body
  apiGateway.addGatewayResponse(
    apiGatewaySettings.apiResponseNames.response400,
    {
      type: apigateway.ResponseType.BAD_REQUEST_BODY,
      statusCode: "400",
      responseHeaders: {
        "Content-Type": "'application/json'",
      },
      templates: {
        "application/json": JSON.stringify({ message: "Invalid request body" }),
      },
    }
  );

  // Add a gateway response for a 404 Not Found response
  apiGateway.addGatewayResponse(
    apiGatewaySettings.apiResponseNames.response404,
    {
      type: apigateway.ResponseType.RESOURCE_NOT_FOUND,
      statusCode: "404",
      responseHeaders: {
        "Content-Type": "'application/json'",
      },
      templates: {
        "application/json": JSON.stringify({ message: "Resource Not Found" }),
      },
    }
  );

  // Add a gateway response for a 403 Access denied response
  apiGateway.addGatewayResponse(
    apiGatewaySettings.apiResponseNames.response403,
    {
      type: apigateway.ResponseType.ACCESS_DENIED,
      statusCode: "403",
      responseHeaders: {
        "Content-Type": "'application/json'",
      },
      templates: {
        "application/json": JSON.stringify({ message: "ACCESS DENIED" }),
      },
    }
  );

  // Add a gateway response for a 500 Internal Server Error response
  apiGateway.addGatewayResponse(
    apiGatewaySettings.apiResponseNames.response500,
    {
      type: apigateway.ResponseType.DEFAULT_5XX,
      statusCode: "500",
      responseHeaders: {
        "Content-Type": "'application/json'",
      },
      templates: {
        "application/json": JSON.stringify({
          message: "Internal Server Error",
        }),
      },
    }
  );

  return {
    apiGateway: apiGateway,
    requestValidator: requestValidator,
    apiVersion: apiGatewaySettings.apiVersion,
  };
}
