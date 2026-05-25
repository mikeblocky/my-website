const MAX_IMAGE_DIMENSION = 1400
const MAX_IMAGE_BYTES = 850 * 1024

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read image.'))
    reader.readAsDataURL(blob)
  })
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not load image.'))
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Could not process image.'))
      }
    }, type, quality)
  })
}

export async function prepareImageForUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be attached.')
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Could not process image.')
    }

    canvas.width = width
    canvas.height = height
    context.drawImage(image, 0, 0, width, height)

    let blob = await canvasToBlob(canvas, 'image/jpeg', 0.82)

    if (blob.size > MAX_IMAGE_BYTES) {
      blob = await canvasToBlob(canvas, 'image/jpeg', 0.68)
    }

    if (blob.size > MAX_IMAGE_BYTES) {
      const smallCanvas = document.createElement('canvas')
      const smallContext = smallCanvas.getContext('2d')
      if (!smallContext) {
        throw new Error('Could not process image.')
      }

      const smallScale = Math.min(1, 960 / Math.max(width, height))
      smallCanvas.width = Math.max(1, Math.round(width * smallScale))
      smallCanvas.height = Math.max(1, Math.round(height * smallScale))
      smallContext.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height)
      blob = await canvasToBlob(smallCanvas, 'image/jpeg', 0.66)
    }

    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large. Please choose a smaller image.')
    }

    return readBlobAsDataUrl(blob)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
