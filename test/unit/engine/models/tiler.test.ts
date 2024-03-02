import { isRenderableImage } from '@/engine/models/tiler'
import { RenderableImage } from '@/store/modules/workview/types'

describe('isRenderableImage', () => {
  it('reject not renderable images', () => {
    expect(isRenderableImage(undefined)).toBeFalsy()
    expect(isRenderableImage('loading')).toBeFalsy()
    expect(isRenderableImage('error')).toBeFalsy()
    expect(isRenderableImage('image-error')).toBeFalsy()
  })

  it('allows RenderableImage', () => {
    const renderableImage: RenderableImage = {
      data: new Image(),
      rawData: null,
      transformedData: null,
      lastWindowLevels: [1, 255],
      lastColorMap: 'default'
    }

    expect(isRenderableImage(renderableImage)).toBeTruthy()
  })
})
