import {
  accountAlreadyExists,
  AccountRepository,
} from '@domain/port/account.repository';
import { Account } from '@domain/model';
import { errAsync, okAsync } from 'neverthrow';

export type InMemoryAccountRepository = AccountRepository & {
  clearAll: () => Promise<void>;
};

export const getInMemoryAccountRepository = (): InMemoryAccountRepository => {
  const accounts: Map<string, Account> = new Map<string, Account>();
  return {
    create: (account: Account) => {
      if (accounts.get(account.id)) {
        return errAsync(accountAlreadyExists);
      }
      accounts.set(account.id, account);
      return okAsync(account);
    },
    clearAll: async () => {
      accounts.clear();
    },
  };
};
