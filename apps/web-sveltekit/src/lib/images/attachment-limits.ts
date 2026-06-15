export const MAX_ATTACHMENT_COUNT = 4
export const MAX_ATTACHMENT_TOTAL_CHARS = 3_600_000

export function validateImageUrls(imageUrls: string[] = []) {
  if (imageUrls.length > MAX_ATTACHMENT_COUNT) {
    return `Please attach no more than ${MAX_ATTACHMENT_COUNT} images.`
  }

  const totalChars = imageUrls.reduce((total, url) => total + url.length, 0)
  if (totalChars > MAX_ATTACHMENT_TOTAL_CHARS) {
    return 'Attached images are too large. Please use fewer or smaller images.'
  }

  return null
}
