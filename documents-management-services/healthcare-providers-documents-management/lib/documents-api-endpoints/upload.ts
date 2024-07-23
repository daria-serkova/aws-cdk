import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { awsResourcesNamingConvention, region } from "../../helpers/utilities";
import { resolve, dirname} from 'path';
import { Duration } from "aws-cdk-lib";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Policy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
const resourcesNames = {
    lambda:  awsResourcesNamingConvention.replace('$', 'upload-document'),
    iamRole: awsResourcesNamingConvention.replace('$', 'upload-document-role'),
    iamPolicy: awsResourcesNamingConvention.replace('$', 'upload-document-policy'),
};
export default function uploadDocumentAction(scope: Construct, 
    lambdasFolder: string, 
    logs: { group?: LogGroup; policy: any }) {
    const iamRole = new Role(scope, resourcesNames.iamRole, {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        roleName: resourcesNames.iamRole,
    });
    iamRole.attachInlinePolicy(
        new Policy(scope, resourcesNames.iamPolicy, {
            policyName: resourcesNames.iamPolicy,
            statements: [logs.policy],
        })
    );
    const lambda = new NodejsFunction(scope, resourcesNames.lambda, {
        functionName: resourcesNames.lambda,
        description: 'Lambda function to handle document uploads',
        entry: resolve(dirname(__filename), `${lambdasFolder}/upload.ts`),
        memorySize: 256,
        timeout: Duration.minutes(3),
        handler: 'handler',
        logGroup: logs.group,
        role: iamRole,
        environment: {
            REGION: region,
        },
    });
}