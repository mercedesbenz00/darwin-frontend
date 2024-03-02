import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'

import { Camera } from '@/engineCommon/camera'
import { Editor } from '@/engineV2/editor'
import { ILayer, Raster } from '@/engineV2/models'
import { Annotation } from '@/engineV2/models/annotation'
import { Layer } from '@/engineV2/models/layers'
import { MaskRenderer } from '@/engineV2/plugins/mask/MaskRenderer'
import { View } from '@/engineV2/views/view'

const fileId: string = 'fileId.1.2.3.4.5'
const annotationId: string = 'maskAnnotationId'
const classId: number = 1
const annotationColor = {r: 255, g: 0, b: 0, a: 1}

const imageWidth: number = 64
const imageHeight: number = 64
const clientWidth: number = 500
const clientHeight: number = 300

const mockCamera = new Camera()

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        camera: mockCamera,
        rasterAnnotationLayer: {
          changed: jest.fn()
        },
        fileManager: {
          file: {
            id: fileId,
            metadata: {
              width: imageWidth,
              height: imageHeight
            }
          }
        }
      }
    })
  }
})
// Mock the files that extend view so this test compiles.
jest.mock('@/engineV2/views/ImageView')
jest.mock('@/engineV2/models/annotation', () => {
  return {
    Annotation: jest.fn().mockImplementation(() => {
      return {
        classId,
        annotationId,
        type: 'mask',
        color: annotationColor
      }
    })
  }
})

let store: ReturnType<typeof createTestStore>
let editor: Editor
let maskRenderer: MaskRenderer

let view: View
let layer: ILayer

describe('Mask rendering', () => {
  const radius = 5

  beforeEach(() => {
    store = createTestStore()
    editor = createEditorV2(store)

    maskRenderer = new MaskRenderer(editor)

    // @ts-ignore -> Mock view object, don't need to pass in props.
    view = new View()
    layer = new Layer(view.camera)

    // Set the width and height of the layer canvas
    layer.canvas.width = clientHeight
    layer.canvas.height = clientWidth

    // Set a width and height for the camera different to the image.
    view.camera.setHeight(clientHeight)
    view.camera.setWidth(clientWidth)
    // Set the image height
    view.camera.setImage({width: imageWidth, height: imageHeight})
  })

  const fillRasterWithData = (raster: Raster): void => {
    const mask: Uint8Array = raster.buffer
    const { width, height } = raster

    const middleX = Math.floor(width / 2)
    const middleY = Math.floor(height / 2)

    // Generate some mock data
    const center = [middleX, middleY]

    for (let j = center[1] - radius; j < center[1] + radius; j++) {
      for (let i = center[0] - radius; i < center[0] + radius; i++) {
        const xDist = Math.abs(i - center[0])
        const yDist = Math.abs(j - center[1])

        const dist = Math.sqrt(xDist * xDist + yDist * yDist)

        if (dist < radius) {
          mask[j * width + i] = classId
        }
      }
    }
  }

  it('Cleanly renders a single raster segment onto the raster layer canvas', () => {
    // Note this uses jest-canvas-mock, so we can't test much more than
    // running with no errors in node. It would be good to harden this with e2e
    // canvas tests in the future.
    const raster = new Raster(view)

    fillRasterWithData(raster)

    // @ts-ignore -> Mocking annotation object, don't need to pass in props.
    const annotation = new Annotation()

    const renderSpy = jest.spyOn(maskRenderer, 'render')

    maskRenderer.render(view, layer, raster, [annotation])

    expect(renderSpy).toBeCalled()
  })
})
