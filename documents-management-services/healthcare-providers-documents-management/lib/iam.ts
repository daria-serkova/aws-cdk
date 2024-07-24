import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { resourceName } from "../helpers/utilities";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";

export const createLambdaRole = (scope: Construct, name: string) => {
    return new Role(scope, resourceName(name), {
        roleName: resourceName(name),
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
}
export const createStepFunctionRole = (scope: Construct, name: string) => {
    return new Role(scope, resourceName(name), {
        roleName: resourceName(name),
        assumedBy: new ServicePrincipal('states.amazonaws.com'),
      });
}
export const createApiGatewayRole = (scope: Construct, name: string) => {
    return new Role(scope, resourceName(name), {
        roleName: resourceName(name),
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      });
}
export const addDynamoDbPutPolicy = (role: Role, tableName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            'dynamodb:PutItem'
        ],
        resources: [
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
        ],
    }));
}
export const addS3PutPolicy = (role: Role, bucketName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            's3:PutObject',
            's3:PutObjectAcl',
        ],
        resources: [
            `arn:aws:s3:::${bucketName}`, 
            `arn:aws:s3:::${bucketName}/*`,
        ],
    }));
}
export const addStepFunctionExecutionPolicy = (role: Role, stateMachineName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: ['states:StartExecution'],
        resources: [ `arn:aws:states:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:stateMachine:${stateMachineName}` ],
    }));
}