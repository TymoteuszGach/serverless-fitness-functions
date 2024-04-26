#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyStatefulStack, MyStatelessStack } from './stacks';
import { Tags } from './aspects/required-tags';

const app = new cdk.App();

const tags: Tags = {
  namespace: 'my-app',
  'service-name': 'accounts',
  'service-owner': 'Bruce Lee'
};

const statefulStack = new MyStatefulStack(app, 'MyStatefulStack', { tags });
const statelessStack = new MyStatelessStack(app, 'MyStatelessStack', {
  tags,
  accountsTable: statefulStack.table
});
const stacks = [statefulStack, statelessStack];

// stacks.forEach((stack) => {
//   cdk.Aspects.of(app).add(new RequiredTagsRule(requiredTags));
//   cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));
// });
