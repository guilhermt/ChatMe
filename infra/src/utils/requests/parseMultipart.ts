/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type APIGatewayEvent } from 'aws-lambda';
import { parseMultipartBody } from './parseMultipartBody';
import {
  type NestedObject,
  reconstructRequestBody
} from './reconstructRequestBody';
import { clearObjectProperties } from '../general/clearObjectProperties';

export const parseMultipartRequest = async (
  event: APIGatewayEvent
): Promise<NestedObject> => {
  const { fields, files } = await parseMultipartBody(event);

  const parsedFields = clearObjectProperties(fields);

  const parsedFiles = clearObjectProperties(files);

  const body = reconstructRequestBody(parsedFields, parsedFiles);

  return body;
};
