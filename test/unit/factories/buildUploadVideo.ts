import { UploadVideo } from '@/store/modules/datasetUpload/types'

import { createFile } from './createFile'

export const buildUploadVideo = (params: Partial<UploadVideo> = {}): UploadVideo => ({
  data: {
    category: 'video',
    setId: 1,
    signingURL: null,
    status: 'added',
    sentBytes: 0,
    totalBytes: 500
  },
  file: createFile('1.mp4', 'video/mp4'),
  annotateAsFrames: true,
  ...params
})
