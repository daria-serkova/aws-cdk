import { Construct } from "constructs";
import { getCloudWatchDocumentsManagementHIPAALogsGroups, getCloudWatchDocumentsManagementLogsGroups, getCloudWatchDocumentsManagementPCIDSSLogsGroups, getCloudWatchDocumentsManagementPIILogsGroups } from "../resource-reference";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy } from "aws-cdk-lib";
import { isProduction } from "../../helpers/utils";

/**
 * Function creates and configure CloudWatch resources
 */
 export default function configureCloudWatchResources(scope: Construct) {
    let groupNames = getCloudWatchDocumentsManagementLogsGroups();
    groupNames.forEach(name => {
        new LogGroup(scope, name, {
            logGroupName:name,
            removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        });
    });
    groupNames = getCloudWatchDocumentsManagementHIPAALogsGroups();
    groupNames.forEach(name => {
        new LogGroup(scope, name, {
            logGroupName:name,
            removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        });
    });
    groupNames = getCloudWatchDocumentsManagementPIILogsGroups();
    groupNames.forEach(name => {
        new LogGroup(scope, name, {
            logGroupName:name,
            removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        });
    });
    groupNames = getCloudWatchDocumentsManagementPCIDSSLogsGroups();
    groupNames.forEach(name => {
        new LogGroup(scope, name, {
            logGroupName:name,
            removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: isProduction ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        });
    });
}