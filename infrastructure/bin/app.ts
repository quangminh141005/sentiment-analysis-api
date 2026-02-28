#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/monitorin-stack';
import { MonitoringStack } from '../lib/monitoring-stack';

const app = new cdk.App()

// api stack
const apiStack = new ApiStack(app, 'SentimentApiStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1', // singapore
    }
});

// monitoring stack
new MonitoringStack(app, 'SentimentMonitoringStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-1'
    },
    // pass lambda for MonitoringStack to watch
    lambdaFunction: apiStack.sentimentFunction,
});