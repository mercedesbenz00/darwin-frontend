import { AnnotationClassPayload } from '@/store/types'

import { UploadFile, UploadStatus } from './types'

export type DatasetUploadState = {
  datasetId: number | null
  files: UploadFile[]
  status: UploadStatus
  tags: string[]
  tagClasses: AnnotationClassPayload[]
  path: string
  /**
   * The file currently being configured by, for example, the video modal
   */
  currentUploadFile: null | UploadFile
}

export const getInitialState = (): DatasetUploadState => ({
  datasetId: null,
  files: [],
  status: 'stopped',
  tags: [],
  tagClasses: [],
  path: '',
  currentUploadFile: null
})

export const state: DatasetUploadState = getInitialState()
