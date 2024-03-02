export const loadImageData = (image: HTMLImageElement) => {
  const { width, height } = image

  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const ctx = tmpCanvas.getContext('2d')
  if (!ctx) { return null }
  ctx.drawImage(image, 0, 0)
  const imageBuf = ctx.getImageData(0, 0, width, height)
  tmpCanvas.remove()
  return imageBuf
}
