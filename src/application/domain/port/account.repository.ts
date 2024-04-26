import { Account } from '@domain/model';
import { ResultAsync } from 'neverthrow';

export type AccountRepository = {
  create: (account: Account) => ResultAsync<Account, AccountAlreadyExistsFailure>;
};

export type AccountAlreadyExistsFailure = { type: 'account-already-exists' };

export const accountAlreadyExists: AccountAlreadyExistsFailure = {
  type: 'account-already-exists',
};
