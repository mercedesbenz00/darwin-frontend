import { UploadFile } from '@/components/Dataset/DropZone/types'

export const imageCount = () => (uploadFile: UploadFile): number => {
  const { data } = uploadFile

  if (data.category === 'video' && data.extractRate && data.duration) {
    return Math.ceil(data.extractRate * data.duration)
  }

  return 1
}
