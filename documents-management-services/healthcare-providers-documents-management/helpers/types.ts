import { RequestValidator, RestApi } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export interface LogsResources {
    group: LogGroup;
    policy: PolicyStatement;
}

export interface ApiResources {
    apiGateway: RestApi,
    requestValidator: RequestValidator,
    apiVersion: string,
}