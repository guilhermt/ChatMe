/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type APIGatewayEvent } from 'aws-lambda';
import Busboy from 'busboy';

export type Fields = Record<string, string | number | boolean | undefined>;

export interface ParsedFile {
  content: any;
  type: string;
}

export type Files = Record<string, ParsedFile>;

interface ParsedBody {
  fields: Fields;
  files: Files;
}

export const parseMultipartBody = async (
  event: APIGatewayEvent
): Promise<ParsedBody> =>
  await new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type']
      }
    });

    const fields: Fields = {};

    const files: Files = {};

    busboy.on('file', (fieldname, file, info) => {
      const uploadFile = {} as ParsedFile;

      file.on('data', (data) => {
        uploadFile.content = data;
        uploadFile.type = info.mimeType;
      });

      file.on('end', () => {
        if (uploadFile.content) {
          files[fieldname] = uploadFile;
        }
      });
    });

    busboy.on('field', (fieldname, value) => {
      const isNumber = value !== '' && !isNaN(+value);

      if (isNumber) {
        fields[fieldname] = +value;
        return;
      }

      const isBoolean = ['true', 'false'].includes(value);

      if (isBoolean) {
        fields[fieldname] = value === 'true';
        return;
      }

      const isUndefined = value === 'undefined';

      if (isUndefined) {
        fields[fieldname] = undefined;
        return;
      }

      fields[fieldname] = value;
    });

    busboy.on('error', (error) => {
      reject(error);
    });

    busboy.on('finish', () => {
      resolve({ fields, files });
    });

    const encoding = event.isBase64Encoded ? 'base64' : 'binary';

    busboy.write(event.body, encoding);

    busboy.end();
  });
