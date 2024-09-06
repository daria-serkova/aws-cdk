import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';

import { addCloudWatchPutPolicy, createLambdaRole } from './iam';
import { ResourceName } from '../resource-reference';
import { firehoseDataStreamLogGroup } from './cloud-watch';

const lambdaFilesLocation = '../../functions';

/**
 * Lambdas, related to Audit functionality
 */

let dataStreamTransformationLambdaInstance: NodejsFunction;
export const dataStreamTransformationLambda = () => dataStreamTransformationLambdaInstance;

const defaultLambdaSettings = {
    memorySize: 256,
    timeout: Duration.minutes(3),
    handler: 'handler',
}
/**
 * Configuration of Lambda functions
 * @param scope 
 */
export default function configureLambdaResources(scope: Construct) {
    dataStreamTransformationLambdaInstance = configureDdataStreamTransformationLambda(scope);
}
const configureDdataStreamTransformationLambda = (scope: Construct): NodejsFunction => {
    const iamRole = createLambdaRole(scope, ResourceName.iam.DATA_STREAM_TRANSFORMATION_LAMBDA);
    addCloudWatchPutPolicy(iamRole, ResourceName.cloudWatch.AUDIT_EVENTS_FIREHOSE_STREAM_LG)
    //addCloudWatchGeneralPutPolicy(iamRole);
    const lambda = new NodejsFunction(scope, ResourceName.lambda.DATA_STREAM_TRANSFORMATION_LAMBDA, {
        functionName: ResourceName.lambda.DATA_STREAM_TRANSFORMATION_LAMBDA,
        description: 'Stores audit events in the DynamoDB',
        entry: resolve(dirname(__filename), `${lambdaFilesLocation}/data-transformation.ts`),
        role: iamRole,
        logGroup: firehoseDataStreamLogGroup(),
        environment: {
            REGION: process.env.AWS_REGION || '',
            AWS_RESOURCES_NAME_PREFIX: process.env.AWS_RESOURCES_NAME_PREFIX || '',
            TAG_ENVIRONMENT: process.env.TAG_ENVIRONMENT || '',
        },
        ...defaultLambdaSettings
    });
    return lambda;   
}