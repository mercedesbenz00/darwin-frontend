import { UploadFile } from '@/store/modules/datasetUpload/types'

import { createFile } from './createFile'

export const buildUploadOtherFile = (params: Partial<UploadFile> = {}): UploadFile => ({
  data: {
    category: 'other',
    setId: 1,
    signingURL: null,
    status: 'added',
    sentBytes: 0,
    totalBytes: 100
  },
  file: createFile('1.mov', 'video/quicktime'),
  ...params
})
