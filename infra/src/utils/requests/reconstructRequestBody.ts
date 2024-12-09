import { type Fields, type Files } from './parseMultipartBody';

export type NestedObject = Record<string, any>;

const setNestedValue = (obj: NestedObject, path: string, value: any): void => {
  const keys = path.split(/[[\]]/).filter((key) => key !== '');
  keys.reduce((acc, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
    } else {
      acc[key] = acc[key] || (isNaN(+keys[index + 1]) ? {} : []);
    }
    return acc[key];
  }, obj);
};

export const reconstructRequestBody = (fields: Fields, files: Files) => {
  const result: NestedObject = {};

  for (const [key, value] of Object.entries(fields)) {
    setNestedValue(result, key, value);
  }

  for (const [key, file] of Object.entries(files)) {
    setNestedValue(result, key, file);
  }

  return result;
};
