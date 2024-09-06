import { AnyPrincipal, Effect, Policy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { generateUUID } from "../../helpers/utils";

export const createLambdaRole = (scope: Construct, name: string) => {
    return new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
}
export const createKinesisFirehoseRole = (scope: Construct, name: string) => {
    return new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
    });
}
export const addS3WritePolicy = (role: Role, bucketName: string) => {
    const policyName = `${bucketName}-write-policy`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    's3:PutObject',
                    's3:PutObjectAcl',
                ],
                resources: [
                    `arn:aws:s3:::${bucketName}`, 
                    `arn:aws:s3:::${bucketName}/*`,
                ],
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}
export const addKMSPolicy = (role: Role, kmsKey: string) => {
    const policyName = `${kmsKey}-policy`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'kms:Encrypt',
                    'kms:Decrypt',
                    'kms:ReEncrypt*',
                    'kms:GenerateDataKey*'
                ],
                resources: [
                    `arn:aws:kms:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:key/${kmsKey}`
                ],
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}
export const addCloudWatchPutPolicy = (role: Role, logGroupName: string) => {
    const policyName = `${logGroupName}-write-policy-${generateUUID()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                ],
                resources: [
                    `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:log-group:${logGroupName}:*`
                ]
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}
export const addLambdaInvokePolicy = (role: Role, lambdaName: string) => {
    const policyName = `${lambdaName}-invoke-policy`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: ['lambda:InvokeFunction'],
                resources: [
                    `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:function:${lambdaName}`,
                ],
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}