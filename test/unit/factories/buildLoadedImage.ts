import { LoadedImage } from '@/store/modules/workview/types'

type LoadedVideoBuildParams = Partial<LoadedImage>

export const buildLoadedImage = (params: LoadedVideoBuildParams = {}): LoadedImage => ({
  id: -1,
  datasetImageId: null,
  taskId: null,
  url: 'url',
  thumbnailURL: 'thumbnail_url',
  originalFilename: 'file.png',
  width: 100,
  height: 100,
  data: null,
  ...params
})
