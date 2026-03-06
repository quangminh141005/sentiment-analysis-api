import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * logs from 'aws-cdk-lib/aws-logs';
import * as ecr-assets from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';
import * as path from 'path';

export class SentimentApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

    // build a docker for lambda 
    const dockerImage = new ecr_assets.DockerImageAsset(this, 'SentimentModelImage', {
        directory: path.join(__dirname, '../../lambda-inference'),
    });

    // ML inference for lambda (python and docker)
    const mlLambda = new lambda.DockerImageFunction(this, 'MLInferenceLambda', {
        code: lambda.DockerImageCode.fromEcr(dockerImage.repository, {
            tagOrDigest: dockerImage.imageTag,
        }),
        memorySize: 3008, // ram for model (increase as needed)
        timeout: cdk.Duration.seconds(30),
        environment: {
            MODEL_PATH: '/opt/ml/model',
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // API layer lambda
    const apiLambda = new lambda.Function(this, 'APILambda', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-api')),
        environment: {
            ML_LAMBDA_NAME: mlLambda.functionName,
        },
        timeout: cdk.Duration.seconds(30),
    });

    // grant permission for api lambda to invoke ML Lambda
    mlLambda.grantInvoke(apiLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'SentimentAPI', {
        restApiName: 'Sentiment Analysis API',
        description: 'API for sentiment analysis using ML',
        deployOptions: {
            loggingLevel: apigateway.MethodLoggingLevel.INFO,
            dataTraceEnabled: true,
        },
    });

    //Routes
    const sentimentResource = api.root.addResource('analyze');
    sentimentResource.addMethod(
        'POST',
        new apigateway.LambdaIntegration(apiLambda)
    );

    // ADD CORS
    sentimentResource.addCorsPreflight({
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'OPTIONS'],
    });

    // outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
        value: api.url,
        description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'MLLambdaArn', {
        value: mlLambda.functionArn,
        description: 'ML Lambda ARN',
    });
    }
}