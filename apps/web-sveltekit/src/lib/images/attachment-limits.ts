import { imageSize } from 'image-size';
export const MAX_ATTACHMENT_COUNT = 4
export const MAX_ATTACHMENT_TOTAL_CHARS = 3_600_000

export function validateImageUrls(imageUrls: string[] = [], imageUrl?: unknown) {
  const urls = [...new Set([...(imageUrl ? [imageUrl] : []), ...imageUrls])];
  if (urls.some(url=>typeof url!=='string')) return 'Invalid image.';
  imageUrls = urls as string[];
  if (imageUrls.length > MAX_ATTACHMENT_COUNT) {
    return `Please attach no more than ${MAX_ATTACHMENT_COUNT} images.`
  }

  const totalChars = imageUrls.reduce((total, url) => total + url.length, 0)
  if (totalChars > MAX_ATTACHMENT_TOTAL_CHARS) {
    return 'Attached images are too large. Please use fewer or smaller images.'
  }

  for (const url of imageUrls) {
    const match=url.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
    if(!match)return 'Upload a PNG, JPEG or WebP image.';
    try {
      const size=imageSize(Buffer.from(match[2],'base64'));
      if(size.type!==({png:'png',jpeg:'jpg',webp:'webp'}[match[1]])||!size.width||!size.height||size.width*size.height>12000000)return 'Image dimensions are too large or invalid.';
    }catch{return 'Image data is invalid.';}
  }

  return null
}
