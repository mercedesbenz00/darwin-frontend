import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor, PluginContext } from '@/engine/editor'
import { ItemManager, Tool } from '@/engine/managers'
import { sharedBackendPlugins } from '@/engine/managers/pluginManager'
import edit from '@/engine/plugins/edit'
import { resolvePolygonDeletableVertexContext } from '@/engine/plugins/edit/utils'
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

  const editConfig = sharedBackendPlugins.find(plugin => plugin.name === 'edit')
  if (!editConfig) { return }

  editor.pluginManager.install(editConfig)
  if (!editConfig.context) { return }

  context = editConfig.context
  jest.spyOn(context, 'registerTool')

  const editTool = editor.toolManager.findByName('edit_tool')
  if (!editTool) { return }

  tool = editTool.tool
})

it('activate edit tool on activate', () => {
  edit.activate(context)
  expect(context.registerTool).toHaveBeenCalledWith('edit_tool', tool)
})

describe('resolvePolygonDeletableVertexContext', () => {
  test('returns null if no points are selected among all paths', () => {
    const compoundPath = {
      path: [
        new EditablePoint<'Image'>({ x: 1, y: 1 }),
        new EditablePoint<'Image'>({ x: 1, y: 6 }),
        new EditablePoint<'Image'>({ x: 6, y: 6 })
      ],
      additionalPaths: []
    }

    expect(resolvePolygonDeletableVertexContext(compoundPath)).toBeNull()
  })

  test('returns DeletableVertexContext object with update action when path is made of 3 points of less', () => {
    const path = [
      new EditablePoint<'Image'>({ x: 1, y: 1 }),
      new EditablePoint<'Image'>({ x: 1, y: 6 }),
      new EditablePoint<'Image'>({ x: 6, y: 6 })
    ]

    const additionalPaths = [[
      new EditablePoint<'Image'>({ x: 2, y: 2 }),
      new EditablePoint<'Image'>({ x: 2, y: 5 }),
      new EditablePoint<'Image'>({ x: 5, y: 5 })
    ]]

    const compoundPath = { path, additionalPaths }

    const pathIndex = 1
    const vertexIndex = 1
    compoundPath.additionalPaths[pathIndex - 1][vertexIndex].isSelected = true

    expect(resolvePolygonDeletableVertexContext(compoundPath)).toEqual({
      action: 'update',
      content: [[path, ...additionalPaths], vertexIndex]
    })
  })

  test('returns DeletableVertexContext object with deleteVertex action when path is made of more than 3 points', () => {
    const path = [
      new EditablePoint<'Image'>({ x: 1, y: 1 }),
      new EditablePoint<'Image'>({ x: 1, y: 6 }),
      new EditablePoint<'Image'>({ x: 6, y: 6 })
    ]

    const additionalPaths = [[
      new EditablePoint<'Image'>({ x: 2, y: 2 }),
      new EditablePoint<'Image'>({ x: 2, y: 5 }),
      new EditablePoint<'Image'>({ x: 5, y: 5 }),
      new EditablePoint<'Image'>({ x: 5, y: 2 })
    ]]

    const compoundPath = { path, additionalPaths }

    const pathIndex = 1
    const vertexIndex = 1
    compoundPath.additionalPaths[pathIndex - 1][vertexIndex].isSelected = true

    expect(resolvePolygonDeletableVertexContext(compoundPath)).toEqual({
      action: 'deleteVertex',
      content: [additionalPaths[pathIndex - 1], vertexIndex]
    })
  })
})
