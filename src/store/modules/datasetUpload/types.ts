import { RootState, TypedAction, TypedMutation } from '@/store/types'

import { DatasetUploadState } from './state'

export type FileStatus =
  'added'
  | 'queued'
  | 'signing'
  | 'signed'
  | 'uploading'
  | 'reporting'
  | 'uploaded-reported'
  | 'error-signing'
  | 'error-uploading'
  | 'error-reporting'

export type UploadFileData = {
  /**
   * Indicates if backend has blocked this file during upload
   * due to some issue, for example, if it was detected as duplicate.
   */
  blocked?: boolean
  category: 'image' | 'video' | 'dicom' | 'pdf' | 'other'
  extractViews?: boolean
  dataURL?: string | ArrayBuffer
  duration?: number
  framerate?: number
  extractRate?: number
  datasetItemId?: number
  path?: string
  setId: number
  signingURL: string | null
  status: FileStatus
  tags?: string[]
  thumbs?: (string | ArrayBuffer)[]
  sentBytes: number
  totalBytes: number
  teamSlug?: string
  datasetSlug?: string
  uploadId?: string
}

export interface UploadImage {
  data: UploadFileData,
  file: File
}

export interface UploadVideo {
  data: UploadFileData,
  file: File
  annotateAsFrames: boolean
}

export type UploadFile = UploadImage | UploadVideo

export const isUploadVideo = (uploadFile: UploadFile): uploadFile is UploadVideo =>
  uploadFile.data.category === 'video'

export const isUploadDicom = (uploadFile: UploadFile): uploadFile is UploadVideo =>
  uploadFile.data.category === 'dicom'

export const isUploadPdf = (uploadFile: UploadFile): uploadFile is UploadVideo =>
  uploadFile.data.category === 'pdf'

export const DEFAULT_DICOM_RATE = 30
export const DEFAULT_PDF_RATE = 30

export type UploadStatus = 'started' | 'stopped'

export type DatasetUploadAction<T, R = any> = TypedAction<DatasetUploadState, RootState, T, R>
export type DatasetUploadMutation<R = any> = TypedMutation<DatasetUploadState, R>
