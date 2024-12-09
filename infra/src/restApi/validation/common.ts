import { clearObjectProperties } from '../../utils/general/clearObjectProperties';
import { numberValidation } from './helpers';

export const getPaginatedItemsValidation = (data: Record<string, any>) => {
  const { pageSize, lastKey, search } = data;

  try {
    const validatedData = {
      pageSize: numberValidation('Page size', pageSize, 1),
      search,
      lastKey
    };

    const clearedData = clearObjectProperties(validatedData) as typeof validatedData;

    return clearedData;
  } catch (e) {
    return (e as Error).message;
  }
};
