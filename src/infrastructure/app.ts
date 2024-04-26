#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyStatefulStack, MyStatelessStack } from './stacks';
import { requiredTags, Tags } from './aspects/required-tags';
import { RequiredTagsRule } from './aspects/required-tags-rule';
import { AwsSolutionsChecks } from 'cdk-nag';
import { CanaryLambdaRule } from './aspects/canary-lambda-rule';

const app = new cdk.App();

const tags: Tags = {
  namespace: 'my-app',
  'service-name': 'accounts',
  'service-owner': 'Bruce Lee',
};

const statefulStack = new MyStatefulStack(app, 'MyStatefulStack', { tags });
new MyStatelessStack(app, 'MyStatelessStack', {
  tags,
  accountsTable: statefulStack.table,
});

cdk.Aspects.of(app).add(new RequiredTagsRule(requiredTags));
cdk.Aspects.of(app).add(new CanaryLambdaRule());
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));
