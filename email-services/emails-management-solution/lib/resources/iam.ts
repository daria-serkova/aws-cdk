import { AnyPrincipal, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

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
export const addPublicAccessPermissionsToS3Bucket = (bucket: Bucket) => {
    // Add a bucket policy to allow public read access
    bucket.addToResourcePolicy(new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
    }));
  
    // Add a bucket policy to deny PutObject to everyone
    bucket.addToResourcePolicy(new PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [`${bucket.bucketArn}/*`],
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
    }));
  };

  export const createS3DeploymentRole = (scope: Construct, name: string) => {
    return new Role(scope, name, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        ],
    });
}

  