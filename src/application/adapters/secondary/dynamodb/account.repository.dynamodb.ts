import { accountAlreadyExists, AccountRepository } from '@domain/port/account.repository';
import { errAsync } from 'neverthrow';

export const getDynamoDbAccountRepository = (): AccountRepository => {
  return {
    create: () => {
      return errAsync(accountAlreadyExists);
    },
  };
};
