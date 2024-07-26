import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
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