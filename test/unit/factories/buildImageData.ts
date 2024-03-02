export const buildImageData = (width: number = 100, height: number = 100): ImageData => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height)
}) as ImageData
