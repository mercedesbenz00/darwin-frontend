import { UploadFile } from '@/components/Dataset/DropZone/types'
import { TERMINAL_STATUSES } from '@/store/modules/datasetUpload/helpers'

export const uploadProgressForFiles = () => (uploadFiles: UploadFile[]): number => {
  if (uploadFiles.length === 0) { return 0 }
  const [uploaded, total] = uploadFiles.reduce<[number, number]>((acc, uploadFile) => {
    const sentBytes = TERMINAL_STATUSES.includes(uploadFile.data.status)
      ? uploadFile.data.totalBytes
      : uploadFile.data.sentBytes

    acc[0] += sentBytes
    acc[1] += uploadFile.data.totalBytes

    return acc
  }, [0, 0])

  return Math.round(uploaded / total * 100)
}
