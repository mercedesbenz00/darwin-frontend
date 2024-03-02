import { UploadFile } from '@/store/modules/datasetUpload/types'

export const THUMB_LIMIT = 3

export type FilesByCategory = {
  images: UploadFile[],
  videos: UploadFile[],
  others: UploadFile[]
}
