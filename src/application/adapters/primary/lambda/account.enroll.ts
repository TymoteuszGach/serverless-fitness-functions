import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { enrollAccountCommand } from '@use-cases';
import {
  badRequestResult,
  createdResult,
  internalServerErrorResult,
} from '@adapters/primary/lambda/responses';
import { getDynamoDbAccountRepository } from '@adapters/secondary/dynamodb/account.repository.dynamodb';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import middy from '@middy/core';
import { captureLambdaHandler, Tracer } from '@aws-lambda-powertools/tracer';
import { logMetrics, Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { logger } from '@adapters/shared/logger';

const tracer = new Tracer();
const metrics = new Metrics();

const accountRepository = getDynamoDbAccountRepository();

const enrollAccount = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return badRequestResult;
  }

  const { email } = JSON.parse(event.body);

  const enrollAccountResult = enrollAccountCommand(accountRepository).execute({
    email,
  });

  return enrollAccountResult.match(
    (account) => {
      metrics.addMetric('EnrollAccountSuccess', MetricUnits.Count, 1);
      return createdResult(account);
    },
    (failure) => {
      metrics.addMetric('EnrollAccountError', MetricUnits.Count, 1);
      switch (failure.type) {
        case 'email-not-valid':
          return badRequestResult;
        case 'account-already-exists':
          return internalServerErrorResult;
      }
    },
  );
};

export const handler = middy(enrollAccount)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
