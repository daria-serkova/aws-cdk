
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';
import { resolve, dirname } from 'path';
import { REGION, resourceName } from '../../../helpers/utilities';

let getDocumentLambdaInstance: NodejsFunction | undefined;
let getListByStatusLambdaInstance: NodejsFunction | undefined;
let getListByUserLambdaInstance: NodejsFunction | undefined;
let getMetadataLambdaInstance: NodejsFunction | undefined;
let updateMetadataLambdaInstance: NodejsFunction | undefined;
let uploadLambdaInstance: NodejsFunction | undefined;
let verifySubmitLambdaInstance: NodejsFunction | undefined;
let verifyConfirmLambdaInstance: NodejsFunction | undefined;
let verifyRejectLambdaInstance: NodejsFunction | undefined;

export function getDocumentLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!getDocumentLambdaInstance) {
        getDocumentLambdaInstance = new NodejsFunction(scope, resourceName('get-document'), {
            functionName: resourceName('get-document'),
            description: 'Processor for /documents/get-document API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/get-document.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return getDocumentLambdaInstance;
}
export function getListByStatusLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!getListByStatusLambdaInstance) {
        getListByStatusLambdaInstance = new NodejsFunction(scope, resourceName('get-list-by-status'), {
            functionName: resourceName('get-list-by-status'),
            description: 'Processor for /documents/get-list-by-status API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/get-list-by-status.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return getListByStatusLambdaInstance;
}
export function getListByUserLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!getListByUserLambdaInstance) {
        getListByUserLambdaInstance = new NodejsFunction(scope, resourceName('get-list-by-user'), {
            functionName: resourceName('get-list-by-user'),
            description: 'Processor for /documents/get-list-by-user API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/get-list-by-user.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return getListByUserLambdaInstance;
}
export function getMetadataLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!getMetadataLambdaInstance) {
        getMetadataLambdaInstance = new NodejsFunction(scope, resourceName('get-metadata'), {
            functionName: resourceName('get-metadata'),
            description: 'Processor for /documents/get-metadata API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/get-metadata.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return getMetadataLambdaInstance;
}
export function updateMetadataLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!updateMetadataLambdaInstance) {
        updateMetadataLambdaInstance = new NodejsFunction(scope, resourceName('update-metadata'), {
            functionName: resourceName('update-metadata'),
            description: 'Processor for /documents/update-metadata API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/update-metadata.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return updateMetadataLambdaInstance;
}
export function getUploadLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!uploadLambdaInstance) {
        uploadLambdaInstance = new NodejsFunction(scope, resourceName('upload-document'), {
            functionName: resourceName('upload-document'),
            description: 'Processor for /documents/upload API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/upload.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return uploadLambdaInstance;
}
export function verifySubmitMetadataLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!verifySubmitLambdaInstance) {
        verifySubmitLambdaInstance = new NodejsFunction(scope, resourceName('verify-submit'), {
            functionName: resourceName('verify-submit'),
            description: 'Processor for /documents/verify-submit API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/verify-submit.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return verifySubmitLambdaInstance;
}
export function verifyConfirmMetadataLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!verifyConfirmLambdaInstance) {
        verifyConfirmLambdaInstance = new NodejsFunction(scope, resourceName('verify-confirm'), {
            functionName: resourceName('verify-confirm'),
            description: 'Processor for /documents/verify-confirm API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/verify-confirm.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return verifyConfirmLambdaInstance;
}
export function verifyRejectMetadataLambda(scope: Construct, lambdaFolder: string): NodejsFunction {
    if (!verifyRejectLambdaInstance) {
        verifyRejectLambdaInstance = new NodejsFunction(scope, resourceName('verify-reject'), {
            functionName: resourceName('verify-reject'),
            description: 'Processor for /documents/verify-reject API endpoint',
            entry: resolve(dirname(__filename), `${lambdaFolder}/verify-reject.ts`),
            memorySize: 256,
            timeout: Duration.minutes(3),
            handler: 'handler',
            //logGroup: logs.group,
            //role: iamRole,
            environment: {
                REGION: REGION,
            },
        });
    }
    return verifyRejectLambdaInstance;
}

