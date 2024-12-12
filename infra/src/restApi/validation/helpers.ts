export const stringValidation = (fieldName: string, value: any, minLength?: number) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required.`);
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} should be a string`);
  }

  if (minLength && value.length < minLength) {
    throw new Error(`${fieldName} should have at least ${minLength} characteres`);
  }

  return value;
};

export const emailValidation = (fieldName: string, value: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} should be a string`);
  }

  if (!emailRegex.test(value)) {
    throw new Error(`${fieldName} must be a valid email.`);
  }

  return value;
};

export const numberValidation = (fieldName: string, value: any, minValue?: number) => {
  if (!value && value !== 0) {
    throw new Error(`${fieldName} is required.`);
  }

  if (typeof value !== 'number') {
    throw new Error(`${fieldName} should be a number`);
  }

  if (minValue && value < minValue) {
    throw new Error(`${fieldName} should be greater than or equal to ${minValue}`);
  }

  return value;
};
