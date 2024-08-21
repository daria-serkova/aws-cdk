import { Construct } from 'constructs';
import { Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { generateUUIDNameSuffix } from '../../helpers/utilities';

/**
 * Creates an IAM Role for an AWS Lambda function with basic permissions.
 * This function is used to create a simple IAM role that can be assumed by AWS Lambda functions. 
 * The role is created with the specified name and is set up to allow Lambda service access. 
 * Additional policies can be attached to the role to grant necessary permissions for Lambda execution.
 * 
 * @param {Construct} scope - The scope in which this role is defined, typically the `this` context in a CDK stack.
 * @param {string} name - The name of the IAM role. This will also be used as the `roleName` in IAM.
 * 
 * @returns {Role} - An instance of the IAM Role that is configured with the following properties:
 */
export const createLambdaRole = (scope: Construct, name: string) : Role => {
    return new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
}
/**
 * Creates an IAM Role for an AWS Step Functions state machine with basic permissions.
 * This function is used to create a simple IAM role that can be assumed by AWS Step Functions. 
 * The role is created with the specified name and is set up to allow Step Functions service access. 
 * A policy is attached to the role to grant permission to start executions of state machines.
 * 
 * @param {Construct} scope - The scope in which this role is defined, typically the `this` context in a CDK stack.
 * @param {string} name - The name of the IAM role. This will also be used as the `roleName` in IAM.
 * 
 * @returns {Role} - An instance of the IAM Role that is configured with the following properties:
 * 
 * (Note: The resource permissions should be restricted further by specifying more restrictive ARNs as needed.)
 */

export const createStateMachineRole = (scope: Construct, name: string) : Role => {
    const stateMachineRole = new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('states.amazonaws.com'),
    });
    stateMachineRole.addToPolicy(new PolicyStatement({
        actions: ['states:StartExecution'],
        resources: ['*'], // TBD: Specify more restrictive ARNs
    }));
    return stateMachineRole;
}
/**
 * Creates an IAM Role for AWS API Gateway with basic permissions.
 * This function is used to create a simple IAM role that can be assumed by AWS API Gateway. 
 * The role is created with the specified name and is set up to allow API Gateway service access. 
 * Additional policies can be attached to the role to grant necessary permissions for API Gateway integrations and operations.
 * 
 * @param {Construct} scope - The scope in which this role is defined, typically the `this` context in a CDK stack.
 * @param {string} name - The name of the IAM role. This will also be used as the `roleName` in IAM.
 * 
 * @returns {Role} - An instance of the IAM Role that is configured with the following properties:
 * 
 * Note: The role returned by this function does not have any specific policies attached, 
 * so it will need additional policies to grant permissions required by API Gateway integrations.
 */

export const createApiGatewayRole = (scope: Construct, name: string) : Role => {
    const apiGatewayRole = new Role(scope, name, {
        roleName: name,
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });
    return apiGatewayRole
}

/**
 * Adds a read-only policy to an IAM role for accessing objects in an S3 bucket.
 * This function attaches a policy statement to the specified IAM role, granting permissions 
 * for reading objects and listing contents within the specified S3 bucket. The permissions 
 * include the ability to get objects, list the bucket, and list bucket versions.
 * 
 * @param {Role} role - The IAM role to which the policy will be added.
 * @param {string} bucketName - The name of the S3 bucket to which the read-only permissions apply. 
 */
export const addS3ReadPolicy = (role: Role, bucketName: string) => {
    const policyName = `s3-read-${bucketName}-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    's3:GetObject',
                    's3:ListBucket',
                    's3:ListBucketVersions'
                ],
                resources: [
                    `arn:aws:s3:::${bucketName}`, 
                    `arn:aws:s3:::${bucketName}/*`,
                ],
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a write-only policy to an IAM role for writing objects to an S3 bucket.
 * This function attaches a policy statement to the specified IAM role, granting permissions 
 * for writing objects and setting object ACLs within the specified S3 bucket. The permissions 
 * include the ability to put objects into the bucket and modify their ACLs.
 * 
 * @param {Role} role - The IAM role to which the policy will be added.
 * @param {string} bucketName - The name of the S3 bucket to which the write-only permissions apply.
 */
export const addS3WritePolicy = (role: Role, bucketName: string) => {
    const policyName = `s3-write-${bucketName}-${generateUUIDNameSuffix()}`.toLowerCase();
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
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a read-only policy to an IAM role for reading items from a DynamoDB table.
 * This function attaches a policy statement to the specified IAM role, granting permissions 
 * for reading items from the specified DynamoDB table. The permissions include the ability 
 * to get items and query the table.
 * 
 * @param {Role} role - The IAM role to which the policy will be added.
 * @param {string} tableName - The name of the DynamoDB table to which the read-only permissions apply.
 */
export const addDynamoDbReadPolicy = (role: Role, tableName: string) => {
    const policyName = `dynamodb-read-${tableName}-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:Query'
                ],
                resources: [
                    `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
                ],
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a write-only policy to an IAM role for writing items to a DynamoDB table.
 * This function attaches a policy statement to the specified IAM role, granting permissions 
 * for writing items to the specified DynamoDB table. The permission includes the ability 
 * to put items into the table.
 * 
 * @param {Role} role - The IAM role to which the policy will be added.
 * @param {string} tableName - The name of the DynamoDB table to which the write-only permissions apply.
 */
export const addDynamoDbWritePolicy = (role: Role, tableName: string) => {
    const policyName = `dynamodb-write-${tableName}-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'dynamodb:PutItem'
                ],
                resources: [
                    `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}`
                ],
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a read-only policy to an IAM role for reading items from a DynamoDB table's index.
 * This function attaches a policy statement to the specified IAM role, granting permissions 
 * for reading items from the specified DynamoDB table's index. The permissions include the ability 
 * to get items and query the table.
 * 
 * @param {Role} role - The IAM role to which the policy will be added.
 * @param {string} tableName - The name of the DynamoDB table to which index the read-only permissions apply.
 * @param {string} indexName - The name of the DynamoDB table's index to which the read-only permissions apply. 
*/
export const addDynamoDbIndexReadPolicy = (role: Role, tableName: string, indexName: string) => {
    const index = indexName.indexOf('index');
    const policyName = `dynamodb-read-${tableName}-${indexName.substring(index)}-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:Query'
                ],
                resources: [
                    `arn:aws:dynamodb:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:table/${tableName}/index/${indexName}`
                ],
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a policy to an IAM role that allows starting execution of an AWS Step Functions state machine.
 * Usually used for API Gateway role, that starts specified workflow based on the API endpoint request.
 * @param {Role} role - The IAM role to which the policy will be attached.
 * @param {string} arn - The ARN of the Step Functions state machine that the role is allowed to execute.
 */
export const addStateMachineExecutionPolicy = (role: Role, arn: string) => {
    const policyName = `state-machine-execute-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: ['states:StartExecution'],
                resources: [arn],
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a policy to an IAM role that allows writing to a specific AWS CloudWatch Log Group.
 * This function creates an inline policy that grants the specified IAM role permissions to create
 * log groups, log streams, and put log events in CloudWatch Logs. The policy is attached to the role,
 * enabling it to interact with the specified log group for logging purposes.
 * 
 * @param {Role} role - The IAM role to which the policy will be attached.
 * @param {string} logGroupName - The name of the CloudWatch Log Group to which the role will be granted access.
 */

export const addCloudWatchPutPolicy = (role: Role, logGroupName: string) => {
    const policyName = `log-group-write-${generateUUIDNameSuffix()}`.toLowerCase();
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
            })
        ],
    });
    role.attachInlinePolicy(policy);
}
/**
 * Adds a policy to an IAM role that grants write permissions to an Audit AWS Kinesis Data Firehose delivery stream (part of separate Audit as a Service solution).
 * This function creates an inline policy that allows the specified IAM role to put records into the designated 
 * Kinesis Data Firehose delivery stream. The policy is attached to the role, enabling it to send data to the 
 * specified delivery stream for further processing or storage.
 * 
 * @param {Role} role - The IAM role to which the policy will be attached.
 */
export const addAuditDataStreamWritePermissions = (role: Role) => {
    const policyName = `audit-data-stream-write-${generateUUIDNameSuffix()}`.toLowerCase();
    const policy = new Policy(role.stack, policyName, {
        policyName: policyName,
        statements: [
            new PolicyStatement({
                actions: [
                    'firehose:PutRecord',
                ],
                resources: [
                    `arn:aws:firehose:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:deliverystream/${process.env.AUDIT_EVENTS_DATA_STREAM}`, 
                ],
            }),
        ],
    });
    role.attachInlinePolicy(policy);
}
