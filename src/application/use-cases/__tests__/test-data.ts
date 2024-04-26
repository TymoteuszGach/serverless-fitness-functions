import { AccountRepository } from '@domain/port/account.repository';
import {
  Account,
  AccountState,
  activateAccount,
  createAccount,
  suspendAccount,
} from '@domain/model';
import { addProfileCommand, AddProfileCommandInput, suspendAccountCommand } from '@use-cases';

export type CreateTestAccountOptions = Readonly<{
  email?: string;
  state?: AccountState;
}>;

export const createTestAccount = async (
  repository: AccountRepository,
  options: CreateTestAccountOptions = {},
): Promise<Account> => {
  const email = options.email ?? 'test@example.com';
  const state = options.state ?? 'active';
  let account = createAccount(email)._unsafeUnwrap();
  if (state === 'active') {
    account = activateAccount(account)._unsafeUnwrap();
  }
  if (state === 'suspended') {
    account = suspendAccount(account)._unsafeUnwrap();
  }
  const createAccountResult = await repository.saveNew(account);
  return createAccountResult._unsafeUnwrap();
};

export const suspendTestAccount = async (
  repository: AccountRepository,
  accountId: string,
): Promise<Account> => {
  const result = await suspendAccountCommand(repository).execute({ accountId });
  return result._unsafeUnwrap();
};

export const addTestProfiles = async (
  repository: AccountRepository,
  account: Account,
  profileNames: string[],
): Promise<Account> => {
  for (const profileName of profileNames) {
    account = await addTestProfile(repository, {
      profileName,
      accountId: account.id,
    });
  }
  return account;
};

const addTestProfile = async (
  repository: AccountRepository,
  input: AddProfileCommandInput,
): Promise<Account> => {
  const result = await addProfileCommand(repository).execute(input);
  return result._unsafeUnwrap();
};
