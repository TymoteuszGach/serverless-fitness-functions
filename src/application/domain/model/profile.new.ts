import crypto from 'node:crypto';
import { Profile } from './profile';

export type NewProfileOptions = Readonly<{
  isDefault?: boolean;
}>;

export const newProfile = (name: string, options: NewProfileOptions = {}): Profile => {
  const isDefault = options?.isDefault ?? false;
  
  return {
    id: crypto.randomUUID(),
    isDefault,
    name,
  };
};
