import { RenderableImage } from '@/store/modules/workview/types'

type Params = Partial<RenderableImage>

export const buildRenderableImage = (params: Params = {}): RenderableImage => ({
  data: new Image(100, 100),
  rawData: null,
  transformedData: null,
  lastWindowLevels: [1, 255],
  lastColorMap: 'default',
  ...params
})
