import { validateEmail } from '../email';

describe('email validation spec', () => {
  describe('email is valid', () => {
    it('if it has a single @', async () => {
      // Arrange
      const emailToValidate = 'test@example.com';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeTruthy();
    });

    it('if it ends with a valid domain', async () => {
      // Arrange
      const emailToValidate = 'test@my.example.event';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeTruthy();
    });
  });

  describe('email is not valid', () => {
    it('if it has multiple @', async () => {
      // Arrange
      const emailToValidate = 'test@@test.com';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it ends with an invalid domain', async () => {
      // Arrange
      const emailToValidate = 'test@my.example.com123';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it does not end with a domain', async () => {
      // Arrange
      const emailToValidate = 'test@my-example';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it ends with an @', async () => {
      // Arrange
      const emailToValidate = 'test@';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it has no @', async () => {
      // Arrange
      const emailToValidate = 'test.example.com';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it is empty', async () => {
      // Arrange
      const emailToValidate = '';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });

    it('if it contains no email id', async () => {
      // Arrange
      const emailToValidate = '@example.com';

      // Act
      const isValid = validateEmail(emailToValidate);

      // Assert
      expect(isValid).toBeFalsy();
    });
  });
});
