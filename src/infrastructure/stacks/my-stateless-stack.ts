import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as codeDeploy from 'aws-cdk-lib/aws-codedeploy';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path';

import { Construct } from 'constructs';
import { MyStack, MyStackProps } from './my-stack';
import { CanaryLambda } from '../constructs/canary-lambda';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Api } from '../constructs/api';

export interface MyStatelessStackProps extends MyStackProps {
  accountsTable: ITable;
}

export class MyStatelessStack extends MyStack {
  constructor(scope: Construct, id: string, props: MyStatelessStackProps) {
    super(scope, id, props);

    const canaryNotificationEmail = 'your.email@example.com';
    const serviceName = props?.tags['service-name'] ?? 'unknown';
    const namespace = props?.tags['namespace'] ?? 'unknown';
    const { accountsTable } = props;

    const lambdaDeploymentTopic: sns.Topic = new sns.Topic(this, 'LambdaDeploymentTopic', {
      displayName: 'Lambda Deployment Topic',
    });
    lambdaDeploymentTopic.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const application = new codeDeploy.LambdaApplication(this, 'CodeDeployApplication');

    const { alias: enrollAccountLambdaAlias, lambda: enrollAccountLambda } = new CanaryLambda(
      this,
      'EnrollAccountLambda',
      {
        description: 'A function to enroll an account',
        stageName: 'prod',
        serviceName: serviceName,
        metricName: 'EnrollAccountError',
        namespace: namespace,
        logRetention: logs.RetentionDays.ONE_DAY,
        architecture: lambda.Architecture.ARM_64,
        application,
        alarmEnabled: true,
        snsTopic: lambdaDeploymentTopic,
        timeout: cdk.Duration.seconds(10),
        retryAttempts: 0,
        deploymentConfig: codeDeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../../application/adapters/primary/lambda/account.enroll.ts'),
        memorySize: 256,
        environment: {
          TABLE_NAME: accountsTable.tableName,
          RANDOM_ERROR: 'false',
          LATENCY: 'true',
          LOG_LEVEL: 'DEBUG',
          POWERTOOLS_LOGGER_LOG_EVENT: 'true',
          POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
          POWERTOOLS_TRACE_ENABLED: 'enabled',
          POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
          POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
          POWERTOOLS_METRICS_NAMESPACE: namespace,
          POWERTOOLS_SERVICE_NAME: serviceName,
        },
      },
    );

    accountsTable.grantReadWriteData(enrollAccountLambda);

    const lambdaDeploymentSubscriptions = lambdaDeploymentTopic.addSubscription(
      new subscriptions.EmailSubscription(canaryNotificationEmail),
    );
    lambdaDeploymentSubscriptions.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const api: apigw.RestApi = new Api(this, 'Api', {
      description: 'An api for accounts management',
      stageName: 'prod',
      deploy: true,
    }).api;

    const sessions: apigw.Resource = api.root.addResource('accounts');

    sessions.addMethod('POST', new apigw.LambdaIntegration(enrollAccountLambdaAlias));
  }
}
