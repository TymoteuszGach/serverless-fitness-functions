import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { MyStack, MyStackProps } from './my-stack';

export interface MyStatefulStackProps extends MyStackProps {}

export class MyStatefulStack extends MyStack {
  readonly table: Table;

  constructor(scope: Construct, id: string, props?: MyStatefulStackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'AccountsTable', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      pointInTimeRecovery: true,
    });
  }
}
