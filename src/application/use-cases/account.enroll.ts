import { Account, createAccount, CreateAccountFailure } from '@domain/model';
import { AccountAlreadyExistsFailure, AccountRepository } from '@domain/port/account.repository';
import { Command } from './command';
import { ResultAsync } from 'neverthrow';

export type EnrollAccountCommandInput = Readonly<{
  email: string;
}>;

export type EnrollAccountCommandFailure = AccountAlreadyExistsFailure | CreateAccountFailure;

export type EnrollAccountCommandResult = ResultAsync<Account, EnrollAccountCommandFailure>;

export const enrollAccountCommand = (
  accountRepository: AccountRepository,
): Command<EnrollAccountCommandInput, EnrollAccountCommandResult> => {
  return {
    execute: (input) => {
      const { email } = input;

      return createAccount(email).asyncAndThen((account) => accountRepository.create(account));
    },
  };
};
