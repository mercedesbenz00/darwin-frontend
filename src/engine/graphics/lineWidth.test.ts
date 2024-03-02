import { lineWidth } from '@/engine/graphics'
import { Camera } from '@/engineCommon/camera'

describe('lineWidth', () => {
  let camera: Camera

  beforeEach(() => {
    camera = new Camera()
  })

  it('returns camera.lineWidth if `inferred` is false', () => {
    expect(lineWidth(camera, false)).toEqual(camera.lineWidth)
  })

  it('returns camera.lineWidth * 2 if `inferred` is true', () => {
    expect(lineWidth(camera, true)).toEqual(camera.lineWidth * 2)
  })
})
