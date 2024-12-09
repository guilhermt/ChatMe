import { type ParsedFile } from '../requests/parseMultipartBody';
import { uploadFileToS3 } from './saveFile';

interface Props {
  orgId: string;
  productId: string;
  image?: ParsedFile | string;
}

export const uploadProductImage = async ({
  orgId,
  productId,
  image
}: Props) => {
  if (!image) return undefined;

  if (typeof image === 'string') return image;

  const imageId = productId.split('#').at(-1);

  const imageExtension = (image?.type ?? '').split('/').at(-1);

  const imagePath = `${orgId}/product-images/${imageId}.${imageExtension}`;

  const imageUrl = await uploadFileToS3(image.content, imagePath, image.type);

  return imageUrl;
};
