import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor, PluginContext } from '@/engine/editor'
import { ItemManager, Tool } from '@/engine/managers'
import { sharedBackendPlugins } from '@/engine/managers/pluginManager'
import skeleton, { getEdgesAsPaths, isSkeleton } from '@/engine/plugins/skeleton'
import { SkeletonNode } from '@/engine/plugins/skeleton/types'
import { EditablePoint } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let context: PluginContext
let tool: Tool

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  const skeletonConfig = sharedBackendPlugins.find(plugin => plugin.name === 'skeleton')
  if (!skeletonConfig) { return }

  editor.pluginManager.install(skeletonConfig)
  if (!skeletonConfig.context) { return }

  context = skeletonConfig.context
  jest.spyOn(context, 'registerTool')

  const skeletonTool = editor.toolManager.findByName('skeleton_tool')
  if (!skeletonTool) { return }

  tool = skeletonTool.tool
})

it('activate skeleton tool on activate', () => {
  skeleton.activate(context)
  expect(context.registerTool).toHaveBeenCalledWith('skeleton_tool', tool)
})

it('isSkeleton type guard is implemented correctly', () => {
  expect(isSkeleton({})).toBeFalsy()
  expect(isSkeleton({ nodes: {} })).toBeTruthy()
})

it('getEdgesAsPaths returns a list of edges where the nodes are not occluded', () => {
  const point1 = new EditablePoint<'Image'>({ x: 1, y: 1 })
  const point2 = new EditablePoint<'Image'>({ x: 2, y: 2 })
  const point3 = new EditablePoint<'Image'>({ x: 3, y: 3 })
  const point4 = new EditablePoint<'Image'>({ x: 4, y: 4 })

  const nodes: SkeletonNode[] = [
    {
      name: 'one',
      point: point1,
      occluded: false
    },
    {
      name: 'two',
      point: point2,
      occluded: false
    },
    {
      name: 'three',
      point: point3,
      occluded: true
    },
    {
      name: 'four',
      point: point4,
      occluded: false
    }
  ]

  const edges = [
    { from: 'one', to: 'two' },
    { from: 'two', to: 'three' },
    { from: 'three', to: 'four' },
    { from: 'four', to: 'one' },
    { from: 'one', to: 'three' },
    { from: 'two', to: 'four' }
  ]

  const paths = getEdgesAsPaths(nodes, edges)

  expect(paths).toContainEqual([point1, point2])
  expect(paths).toContainEqual([point2, point3])
  expect(paths).toContainEqual([point3, point4])
  expect(paths).toContainEqual([point4, point1])
  expect(paths).toContainEqual([point1, point3])
  expect(paths).toContainEqual([point2, point4])
})
