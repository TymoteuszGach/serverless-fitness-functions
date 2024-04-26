import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Tags } from '../aspects/required-tags';

export interface MyStackProps extends cdk.StackProps {
  readonly tags: Tags;
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: MyStackProps) {
    super(scope, id, props);

    const tags = props?.tags;
    
    if (tags) {
      Object.entries(tags).forEach((tag) => {
        cdk.Tags.of(this).add(...tag);
      });
    }
  }
}
