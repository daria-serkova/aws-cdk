import { AnyPrincipal, Effect, Policy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { ResourceName } from "../resource-reference";

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
export const addAuditDataStreamWritePermissions = (role: Role) => {
    const policyName = `${ResourceName.auditDataStream}-write-policy`;
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'firehose:PutRecord',
                ],
                resources: [
                    `arn:aws:firehose:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:deliverystream/${ResourceName.auditDataStream}`, 
                ],
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}

export const addS3ReadPolicy = (role: Role, bucketName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            's3:GetObject',
            's3:ListBucket',
            "s3:ListBucketVersions"
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
            'dynamodb:GetItem',
            'dynamodb:Query'
        ],
        resources: [
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
        ],
    }));
}
export const addDynamoDbIndexReadPolicy = (role: Role, tableName: string, indexName: string) => {
    role.addToPolicy(new PolicyStatement({
        actions: [
            'dynamodb:GetItem',
            'dynamodb:Query'
        ],
        resources: [
            `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}/index/${indexName}`
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
        resources: ['*'], // Specify more restrictive ARNs
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