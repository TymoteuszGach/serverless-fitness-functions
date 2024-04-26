import { getInMemoryAccountRepository } from './account.repository.in-memory';
import { enrollAccountCommand } from '@use-cases';

describe('enroll account spec', () => {
  const repository = getInMemoryAccountRepository();

  beforeEach(async () => {
    await repository.clearAll();
  });

  describe('an account is enrolled', () => {
    it('if email is valid', async () => {
      // Arrange
      const email = 'test@example.com';

      // Act
      const enrollAccountResult = await enrollAccountCommand(repository).execute({
        email,
      });

      // Assert
      const enrolledAccount = enrollAccountResult._unsafeUnwrap();
      expect(enrolledAccount.email).toBe(email);
    });
  });

  describe('an account cannot be enrolled', () => {
    it('if email is not valid', async () => {
      // Arrange
      const email = 'test@example.1234';

      // Act
      const enrollAccountResult = await enrollAccountCommand(repository).execute({
        email,
      });

      // Assert
      const failure = enrollAccountResult._unsafeUnwrapErr();
      expect(failure.type).toBe('email-not-valid');
    });
  });
});
