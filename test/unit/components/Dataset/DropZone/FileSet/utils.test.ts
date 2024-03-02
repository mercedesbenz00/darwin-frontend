import {
  buildUploadImage,
  buildUploadOtherFile,
  buildUploadVideo
} from 'test/unit/factories'

import { FilesByCategory } from '@/components/Dataset/DropZone/FileSet/types'
import { getThumbnailFromFiles } from '@/components/Dataset/DropZone/FileSet/utils'

describe('getThumbnailFromFiles', () => {
  let files: FilesByCategory

  beforeEach(() => {
    const uploadImage = buildUploadImage()
    const uploadVideo = buildUploadVideo()
    const uploadOther = buildUploadOtherFile()
    uploadImage.data.dataURL = 'image-thumbnail'
    uploadVideo.data.thumbs = ['video-thumbnail']
    uploadOther.data.dataURL = 'other-thumbnail'
    files = {
      images: [uploadImage],
      videos: [uploadVideo],
      others: [uploadOther]
    }
  })

  it('should return thumbnails', () => {
    expect(getThumbnailFromFiles(files)).toEqual([
      'video-thumbnail',
      'image-thumbnail',
      'other-thumbnail'
    ])
  })
})
