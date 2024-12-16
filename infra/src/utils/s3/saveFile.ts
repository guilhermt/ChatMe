import { client } from '../../clients/s3';
import {
  PutObjectCommand,
  type PutObjectCommandInput
} from '@aws-sdk/client-s3';
import { configEnv } from '../../config';

const Bucket = configEnv.bucketName;

export const uploadFileToS3 = async (file: any, key: string, type: string) => {
  if (!file || !Bucket) return null;

  const params: PutObjectCommandInput = {
    Bucket,
    Key: key,
    Body: file,
    ContentType: type
  };

  const command = new PutObjectCommand(params);

  await client.send(command);

  const objectUrl = `https://${Bucket}.s3-accelerate.amazonaws.com/${key}`;

  return objectUrl;
};
