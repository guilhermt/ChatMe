import { stringValidation, emailValidation } from '../helpers';

export const signUpValidation = (data: Record<string, any>) => {
  const { name, email, password } = data;

  try {
    const validations = {
      name: stringValidation('User Name', name, 3),
      email: emailValidation('User Email', email),
      password: stringValidation('User Password', password, 6)
    };

    return validations;
  } catch (e) {
    return (e as Error).message;
  }
};
