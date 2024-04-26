import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as codeDeploy from 'aws-cdk-lib/aws-codedeploy';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';

import { Duration, RemovalPolicy } from 'aws-cdk-lib';

import { Construct } from 'constructs';

interface CanaryLambdaProps extends nodeLambda.NodejsFunctionProps {
  /**
   * The stage name which the lambda is being used with
   */
  stageName: string;
  /**
   * The code deploy application which this lambda is part of
   */
  application: codeDeploy.LambdaApplication;
  /**
   * The code deploy lambda deployment config
   */
  deploymentConfig: codeDeploy.ILambdaDeploymentConfig;
  /**
   * whether the alarm is enabled
   */
  alarmEnabled: boolean;
  /**
   * A reference to the sns topic which the alarm will use
   */
  snsTopic: sns.Topic;
  /**
   * the metric name for our alarm
   */
  metricName: string;
  /**
   * the namespace for our alarm
   */
  namespace: string;
  /**
   * the service name for our alarm
   */
  serviceName: string;
}

export class CanaryLambda extends Construct {
  readonly lambda: nodeLambda.NodejsFunction;
  readonly alias: lambda.Alias;
  readonly alarm: cloudwatch.Alarm;
  readonly uncaughtErrorsAlarm: cloudwatch.Alarm;
  readonly deploymentGroup: codeDeploy.LambdaDeploymentGroup;
  private readonly application: codeDeploy.LambdaApplication;
  private readonly deploymentConfig: codeDeploy.ILambdaDeploymentConfig;

  constructor(scope: Construct, id: string, props: CanaryLambdaProps) {
    super(scope, id);

    this.application = props.application;
    this.deploymentConfig = props.deploymentConfig;

    this.lambda = new nodeLambda.NodejsFunction(this, id, {
      ...props,
    });

    const uncaughtErrorMetricFilter = this.lambda.logGroup.addMetricFilter('UncaughtErrorsFilter', {
      filterPattern: logs.FilterPattern.literal('{ $.statusCode = 500 }'),
      metricName: id + 'UncaughtErrors',
      metricNamespace: props.namespace,
    });

    this.uncaughtErrorsAlarm = new cloudwatch.Alarm(this, 'UncaughtErrorsAlarm', {
      alarmName: id + 'UncaughtErrorsAlarm',
      alarmDescription: 'Error 500 over limit',
      metric: uncaughtErrorMetricFilter.metric(),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    this.alias = new lambda.Alias(this, id + 'Alias', {
      aliasName: props.stageName,
      version: this.lambda.currentVersion,
    });

    this.alarm = new cloudwatch.Alarm(this, id + 'Failure', {
      alarmDescription: `${props.namespace}/${props.metricName} deployment errors > 0 for ${id}`,
      actionsEnabled: props.alarmEnabled,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      metric: new cloudwatch.Metric({
        metricName: props.metricName,
        namespace: props.namespace,
        statistic: cloudwatch.Stats.SUM,
        dimensionsMap: {
          service: props.serviceName,
        },
        period: Duration.minutes(1),
      }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
    });

    this.alarm.addAlarmAction(new actions.SnsAction(props.snsTopic));
    this.alarm.applyRemovalPolicy(RemovalPolicy.DESTROY);

    this.uncaughtErrorsAlarm.addAlarmAction(new actions.SnsAction(props.snsTopic));
    this.uncaughtErrorsAlarm.applyRemovalPolicy(RemovalPolicy.DESTROY);

    this.deploymentGroup = new codeDeploy.LambdaDeploymentGroup(this, id + 'CanaryDeployment', {
      alias: this.alias,
      deploymentConfig: this.deploymentConfig,
      alarms: [this.alarm],
      application: this.application,
    });
  }
}
