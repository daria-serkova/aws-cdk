import { AnyPrincipal, Effect, IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";

export const createLambdaRole = (scope: Construct, name: string) => {
    return new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
}
export const addS3WritePolicy = (role: Role, bucketName: string) => {
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
export const addS3ReadPolicy = (role: Role, bucketName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            's3:GetObject',
            's3:ListBucket'
        ],
        resources: [
            `arn:aws:s3:::${bucketName}`, 
            `arn:aws:s3:::${bucketName}/*`,
        ],
    }));
}
export const addDynamoDbWritePolicy = (role: Role, tableName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            'dynamodb:PutItem'
        ],
        resources: [
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
        ],
    }));
}
export const addDynamoDbReadPolicy = (role: Role, tableName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            'dynamodb:GetItem'
        ],
        resources: [
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
        ],
    }));
}

export const addCloudWatchPutPolicy = (role: Role, logGroupName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
        ],
        resources: [
            `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:log-group:${logGroupName}:*`
        ]
    }))
}
export const  addPublicAccessPermissionsToS3Bucket = (bucket: Bucket) => {
    // Add a bucket policy to allow public read access
    bucket.addToResourcePolicy(new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
    }));
  }

  export const createDeploymentRole = (scope: Construct, name: string, bucket: Bucket) => {
    const deploymentRole = new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });
  
      // Add a policy to the role that allows it to deploy files
      deploymentRole.addToPolicy(new PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject'],
        resources: [`${bucket.bucketArn}/*`],
        effect: Effect.ALLOW,
      }));
      return deploymentRole;
  }

  export const createStateMachineRole = (scope: Construct, name: string) => {
    const stateMachineRole = new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('states.amazonaws.com'),
    });
    stateMachineRole.addToPolicy(new PolicyStatement({
        actions: ['states:StartExecution'],
        resources: ['*'], // Specify more restrictive ARNs as needed
    }));
    return stateMachineRole;
  }

  export const createApiGatewayRole = (scope: Construct, name: string) => {
    const apiGatewayRole = new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      });
      return apiGatewayRole
  }
  export const addStateMachineExecutionPolicy = (role: Role, arn: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: ['states:StartExecution'],
        resources: [arn],
    }));
}