import { getFileCategory, isEqual } from '@/components/Dataset/DropZone/fileUtils'

import { DatasetUploadState } from './state'
import { UploadFileData, UploadFile, FileStatus } from './types'

export const toUploadFile = (
  file: File,
  setId: number,
  tags?: string[],
  path?: string
): UploadFile => {
  const category = getFileCategory(file)
  const data: UploadFileData = {
    category,
    setId,
    status: 'added',
    signingURL: null,
    sentBytes: 0,
    tags,
    path,
    totalBytes: file.size
  }
  return { file, data }
}

export const resolveNewFiles = (state: DatasetUploadState, files: File[] | FileList) =>
  Array.from(files).filter(f => !state.files.find(e => isEqual(e.file, f)))

export const resolveNewSet = (state: DatasetUploadState) =>
  state.files.length === 0 ? 1 : Math.max(...state.files.map(f => f.data.setId)) + 1

export const TERMINAL_STATUSES: FileStatus[] = [
  'error-signing', 'error-uploading', 'error-reporting', 'uploaded-reported'
]
