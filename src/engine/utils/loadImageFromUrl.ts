export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = (): void => {
      image.onload = null
      image.onerror = null

      resolve(image)
    }
    image.onerror = (): void => reject(new Error('Image failed to load.'))
    image.src = url
  })
