export const isEqual = (a: File, b: File) =>
  a.name === b.name &&
  a.size === b.size &&
  a.lastModified === b.lastModified

/**
 * load file content for the image thumbnail
 */
export const loadFileContent = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = function (): void { resolve(this.result) }
    fileReader.onerror = (err): void => { reject(err) }
    fileReader.readAsDataURL(file)
  })
}

const loadVideoFromLocal = function (file: File): Promise<HTMLVideoElement> {
  window.URL = window.URL || (window as any).webkitURL

  return new Promise((resolve) => {
    const video = window.document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = function () {
      resolve(video)
    }
    if ((file as any).dataUrl) { // Manually added file
      video.src = (file as any).dataUrl
    } else {
      video.src = window.URL.createObjectURL(file)
    }
  })
}

const getFrame = function (video: HTMLVideoElement, time: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = window.document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    video.addEventListener('seeked', () => {
      video.pause()
      ctx!.drawImage(video, 0, 0)
      resolve(canvas.toDataURL())
    }, { once: true })

    video.currentTime = time
  })
}

/**
 * check if the file is a video or not.
 */
const isVideoFile = (file: File) => {
  const fileType = file.type || (file as any).kind
  if (!fileType) {
    // some web browsers won't populate file.type for some file types
    // in those cases, look at the extension.
    const fileName = file.name
    const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length)
    return ['mkv', 'hvec'].includes(fileExt)
  }
  return fileType && fileType.startsWith('video')
}

/**
 * check if the file is a image or not.
 */
const isImageFile = (file: File) => {
  const fileType = file.type || (file as any).kind
  return fileType && fileType.startsWith('image')
}

/**
 * check if the file is a dcm file --- Dicom
 */
const isDicomFile = (file: File) => file.name.toLowerCase().endsWith('.dcm')

/**
 * check if the file is a nifti file --- NifTi
 */
const isNifTiFile = (file: File) =>
  file.name.toLowerCase().endsWith('.nii') || file.name.toLowerCase().endsWith('.nii.gz')

/**
 * check if the file is a rvg file --- Dicom
 */
const isRVGFile = (file: File) => file.name.toLowerCase().endsWith('.rvg')

/**
 * check if the file is a pdf file --- PDF
 */
const isPdfFile = (file: File) => file.name.toLowerCase().endsWith('.pdf')

/**
 * Checks a files category, which is one of
 * image
 * video
 * other
 */
export const getFileCategory = (file: File) => {
  if (isVideoFile(file)) { return 'video' }
  if (isImageFile(file)) { return 'image' }
  if (isDicomFile(file)) { return 'dicom' }
  if (isRVGFile(file)) { return 'dicom' }
  if (isNifTiFile(file)) { return 'dicom' }
  if (isPdfFile(file)) { return 'pdf' }
  return 'other'
}

export const loadVideo = async (file: File): Promise<{ duration: number, frames: string[] }> => {
  const video = await loadVideoFromLocal(file)

  const extractTime = video.duration * 0.8
  const times = [extractTime * 0.1, extractTime * 0.5, extractTime * 0.9]
  const frames = await Promise.all(times.map(t => getFrame(video, t)))

  window.URL.revokeObjectURL(video.src)

  return { duration: video.duration, frames }
}
