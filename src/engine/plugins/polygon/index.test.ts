import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor, PluginContext } from '@/engine/editor'
import { LinearInterpolationParams } from '@/engine/interpolate'
import { Tool, ItemManager } from '@/engine/managers'
import { sharedBackendPlugins } from '@/engine/managers/pluginManager'
import polygon from '@/engine/plugins/polygon'
import { PolygonRenderer } from '@/engine/plugins/polygon/PolygonRenderer'
import { Polygon } from '@/engine/plugins/polygon/types'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let context: PluginContext
let editor: Editor
let polygonRenderer: PolygonRenderer
let store: ReturnType<typeof createTestStore>
let tool: Tool

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  polygonRenderer = new PolygonRenderer(editor)

  const polygonConfig = sharedBackendPlugins.find(plugin => plugin.name === 'polygon')
  if (!polygonConfig) { return }

  editor.pluginManager.install(polygonConfig)
  if (!polygonConfig.context) { return }

  context = polygonConfig.context
  jest.spyOn(context, 'registerTool')

  const polygonTool = editor.toolManager.findByName('polygon_tool')
  if (!polygonTool) { return }

  tool = polygonTool.tool
})

it('activate polygon tool on activate', () => {
  polygon.activate(context)
  expect(context.registerTool).toHaveBeenCalledWith('polygon_tool', tool)
})

describe('polygonRenderer.interpolate', () => {
  it('interpolates frames linearly correctly', () => {
    const prevPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 1, y: 1 }),
        new EditablePoint<'Image'>({ x: 1, y: 10 }),
        new EditablePoint<'Image'>({ x: 10, y: 1 })
      ],
      additionalPaths: []
    }
    const nextPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 11, y: 1 }),
        new EditablePoint<'Image'>({ x: 11, y: 10 }),
        new EditablePoint<'Image'>({ x: 20, y: 1 })
      ],
      additionalPaths: []
    }
    const params: LinearInterpolationParams = {
      algorithm: 'linear-1.0',
      interpolationFactor: 0.5
    }

    const expectedPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 6, y: 1 }),
        new EditablePoint<'Image'>({ x: 6, y: 10 }),
        new EditablePoint<'Image'>({ x: 15, y: 1 })
      ],
      additionalPaths: []
    }
    expect(polygonRenderer.interpolate(prevPolygon, nextPolygon, params)).toEqual(expectedPolygon)
  })

  it('interpolates linearly when algorithm is not specified at all', () => {
    const prevPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 1, y: 1 }),
        new EditablePoint<'Image'>({ x: 1, y: 10 }),
        new EditablePoint<'Image'>({ x: 10, y: 1 })
      ],
      additionalPaths: []
    }
    const nextPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 11, y: 1 }),
        new EditablePoint<'Image'>({ x: 11, y: 10 }),
        new EditablePoint<'Image'>({ x: 20, y: 1 })
      ],
      additionalPaths: []
    }
    const params: LinearInterpolationParams = {
      algorithm: undefined,
      interpolationFactor: 0.5
    }

    const expectedPolygon: Polygon = {
      path: [
        new EditablePoint<'Image'>({ x: 6, y: 1 }),
        new EditablePoint<'Image'>({ x: 6, y: 10 }),
        new EditablePoint<'Image'>({ x: 15, y: 1 })
      ],
      additionalPaths: []
    }
    expect(polygonRenderer.interpolate(prevPolygon, nextPolygon, params)).toEqual(expectedPolygon)
  })
})
