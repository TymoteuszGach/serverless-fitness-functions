import crypto from 'node:crypto';
import { Account } from './account';
import { newProfile } from '@domain/model/profile.new';
import { validateEmail } from '@domain/model/email';
import { err, ok, Result } from 'neverthrow';

export type CreateAccountFailure = { type: 'email-not-valid' };

const emailNotValid: CreateAccountFailure = { type: 'email-not-valid' };

export const createAccount = (email: string): Result<Account, CreateAccountFailure> => {
  if (!validateEmail(email)) {
    return err(emailNotValid);
  }
  return ok({
    id: crypto.randomUUID(),
    profiles: [newProfile('default', { isDefault: true })],
    state: 'inactive',
    email,
  });
};
