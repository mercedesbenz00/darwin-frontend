import { UploadImage } from '@/store/modules/datasetUpload/types'

import { createFile } from './createFile'

export const buildUploadImage = (params: Partial<UploadImage> = {}): UploadImage => ({
  data: {
    category: 'image',
    setId: 1,
    signingURL: null,
    status: 'added',
    sentBytes: 0,
    totalBytes: 100
  },
  file: createFile('1.jpg', 'image/jpeg'),
  ...params
})
