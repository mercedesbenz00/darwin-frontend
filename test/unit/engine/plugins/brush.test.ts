import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor, PluginContext } from '@/engine/editor'
import { ItemManager, Tool } from '@/engine/managers'
import { sharedBackendPlugins } from '@/engine/managers/pluginManager'
import brush from '@/engine/plugins/brush'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let context: PluginContext
let tool: Tool

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  const brushConfig = sharedBackendPlugins.find(plugin => plugin.name === 'brush')
  if (!brushConfig) { return }

  editor.pluginManager.install(brushConfig)
  if (!brushConfig.context) { return }

  context = brushConfig.context
  jest.spyOn(context, 'registerTool')

  const brushTool = editor.toolManager.findByName('brush_tool')
  if (!brushTool) { return }

  tool = brushTool.tool
})

it('activate brush tool on activate', () => {
  brush.activate(context)
  expect(context.registerTool).toHaveBeenCalledWith('brush_tool', tool)
})
