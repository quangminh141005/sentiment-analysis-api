import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

// Define props: this stack needs a Lambda to watch
interface MonitoringStackProps extends cdk.StackProps {
    lambdaFunction: lambda.IFunction;
}

export class MonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MonitoringStackProps) {
        super(scope, id, props);

        const fn = props.lambdaFunction;

        // 1. CloudWatch Dashboard 
        //  visual page in AWS Console showing charts for your API
        const dashboard = new cloudwatch.Dashboard(this, 'SentimentDashboard', {
            dashboardName: 'SentimentAPI',
        });

        dashboard.addWidgets(
            // Chart: how many times Lambda was called
            new cloudwatch.GraphWidget({
                title: 'Invocations (requests per minute)',
                left: [fn.metricInvocations({ period: cdk.Duration.minutes(1) })],
                width: 8,
            }),
            // Chart: how many errors happened
            new cloudwatch.GraphWidget({
                title: 'Errors',
                left: [fn.metricErrors({ period: cdk.Duration.minutes(1) })],
                width: 8,
            }),
            // Chart: how long each request takes
            new cloudwatch.GraphWidget({
                title: 'Duration (ms)',
                left: [
                    fn.metricDuration({ statistic: 'avg', label: 'Average' }),
                    fn.metricDuration({ statistic: 'p99', label: 'P99 (slowest 1%)' }),
                ],
                width: 8,
            }),
        );

        // Alarm: too many errors 
        // Fires if there are 5+ errors in 5 minutes
        const errorAlarm = new cloudwatch.Alarm(this, 'ErrorAlarm', {
            metric: fn.metricErrors({ period: cdk.Duration.minutes(5) }),
            threshold: 5,
            evaluationPeriods: 1,
            alarmName: 'SentimentAPI-TooManyErrors',
            alarmDescription: 'API has 5+ errors in 5 minutes — check CloudWatch logs',
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        // Alarm: slow responses 
        // Fires if average response is over 15 seconds
        const latencyAlarm = new cloudwatch.Alarm(this, 'LatencyAlarm', {
            metric: fn.metricDuration({
                period: cdk.Duration.minutes(5),
                statistic: 'avg',
            }),
            threshold: 15000,  // 15 seconds in milliseconds
            evaluationPeriods: 2,
            alarmName: 'SentimentAPI-HighLatency',
            alarmDescription: 'API response time > 15s average',
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        // ─── 4. Outputs ───────────────────────────────────────────────────────
        new cdk.CfnOutput(this, 'DashboardUrl', {
            value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=SentimentAPI`,
            description: 'CloudWatch Dashboard URL',
        });

        new cdk.CfnOutput(this, 'ErrorAlarmArn', {
            value: errorAlarm.alarmArn,
            description: 'Error alarm ARN',
        });

        new cdk.CfnOutput(this, 'LatencyAlarmArn', {
            value: latencyAlarm.alarmArn,
            description: 'Latency alarm ARN',
        });
    }
}