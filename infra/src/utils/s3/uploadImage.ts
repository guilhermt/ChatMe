import { type ParsedFile } from '../requests/parseMultipartBody';
import { uploadFileToS3 } from './saveFile';

interface Props {
  userId: string;
  profilePicture?: ParsedFile
}

export const uploadProfilePicture = async ({
  userId,
  profilePicture
}: Props) => {
  if (!profilePicture) return null;

  const { type, content } = profilePicture;

  const imageExtension = (type ?? '').split('/').at(-1);

  const now = Date.now();

  const s3PathKey = `profile-pictures/${userId}/${now}.${imageExtension}`;

  const imageUrl = await uploadFileToS3(content, s3PathKey, type);

  return imageUrl;
};
