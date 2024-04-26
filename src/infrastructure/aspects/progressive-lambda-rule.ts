import { Annotations, IAspect } from 'aws-cdk-lib';

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IConstruct } from 'constructs';
import { ProgressiveLambda } from '../constructs/progressive-lambda';

export class ProgressiveLambdaRule implements IAspect {
  constructor() {}

  public visit(node: IConstruct): void {
    if (node instanceof NodejsFunction) {
      if (!(node.node.scope instanceof ProgressiveLambda)) {
        Annotations.of(node).addError(
          'NodeJsFunction used directly. Please use ProgressiveLambda construct.',
        );
      }
    }
  }
}
