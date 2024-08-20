import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { config } from 'dotenv';
config();
/**
 * Identifies envrironment of the deployment to minimize AWS cost for non-production environments.
 */
export const isProduction = process.env.TAG_ENVIRONMENT === 'production';
/**
* Creates a LambdaInvoke task.
* @param scope 
* @param id 
* @param lambdaFunction 
* @param additionalProps 
*/
export const createLambdaInvokeTask = (scope: Construct, id: string, lambdaFunction: () => any, additionalProps = {}): LambdaInvoke => (
 new LambdaInvoke(scope, id, {
   lambdaFunction: lambdaFunction(),
   outputPath: '$.Payload',
   ...additionalProps
 })
);