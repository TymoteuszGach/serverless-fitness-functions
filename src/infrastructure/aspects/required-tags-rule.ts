import { Annotations, IAspect, Stack } from 'aws-cdk-lib';

import { IConstruct } from 'constructs';

export class RequiredTagsRule implements IAspect {
  constructor(private readonly requiredTags: readonly string[]) {}

  public visit(node: IConstruct): void {
    if (!(node instanceof Stack)) return;

    this.requiredTags.forEach((tag) => {
      if (!Object.keys(node.tags.tagValues()).includes(tag)) {
        Annotations.of(node).addError(`"${tag}" tag is missing from stack "${node.stackName}"`);
      }
    });
  }
}
