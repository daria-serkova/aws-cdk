import { Construct } from "constructs";
import { Key } from 'aws-cdk-lib/aws-kms';
import { ResourceName } from "../resource-reference";
import { isProduction, solutionName } from "../../helpers/utils";
import { RemovalPolicy } from "aws-cdk-lib";

/**
 * Function creates and configure KMS resources
 */
 export default function configureKMSResources(scope: Construct) {
    const kmsKey = new Key(scope, ResourceName.kms.KMS_KEY, {
        alias: `alias/${ResourceName.kms.KMS_KEY}`, // Optional alias for easier reference
        description: `${solutionName}: KMS key for encrypting resources`,
        enableKeyRotation: true,
        removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });
}