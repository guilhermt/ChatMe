export const createUpdateObject = (updateObject: Record<string, any>) => {
  let expression = 'SET ';

  const attributeNames: Record<string, string> = {};

  const attributeValues: Record<string, any> = {};

  const fields = Object.keys(updateObject);

  fields.forEach((field, index) => {
    const attributeNamePlaceholder = `#${field}`;

    const attributeValuePlaceholder = `:${field}`;

    expression += `${attributeNamePlaceholder} = ${attributeValuePlaceholder}`;

    if (index < fields.length - 1) {
      expression += ', ';
    }

    attributeNames[attributeNamePlaceholder] = field;

    attributeValues[attributeValuePlaceholder] = updateObject[field];
  });

  return {
    expression,
    attributeNames,
    attributeValues
  };
};
