import { Profile } from './profile';

export type AccountState = 'inactive' | 'active' | 'suspended';

export type Account = Readonly<{
  id: string;
  email: string;
  profiles: Profile[];
  state: AccountState;
}>;
