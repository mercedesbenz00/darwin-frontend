import { UploadFile } from '@/store/modules/datasetUpload/types'

/**
 * Returns a thumbnail (as data urls).
 */
export const getThumbnailFromFile = (fileItem: UploadFile): string | ArrayBuffer => {
  const { file, data: { thumbs, dataURL } } = fileItem

  if (thumbs?.[0]) { return thumbs[0] }

  if (dataURL) { return dataURL }

  return URL.createObjectURL(file)
}
