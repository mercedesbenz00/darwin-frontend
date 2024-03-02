import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor, PluginContext } from '@/engine/editor'
import { ItemManager, Tool } from '@/engine/managers'
import { sharedBackendPlugins } from '@/engine/managers/pluginManager'
import ellipse from '@/engine/plugins/ellipse'

const localVue = createLocalVue()
localVue.use(Vuex)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let context: PluginContext
let tool: Tool

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  const ellipseConfig = sharedBackendPlugins.find(plugin => plugin.name === 'ellipse')
  if (!ellipseConfig) { return }

  editor.pluginManager.install(ellipseConfig)
  if (!ellipseConfig.context) { return }

  context = ellipseConfig.context
  jest.spyOn(context, 'registerTool')

  const ellipseTool = editor.toolManager.findByName('ellipse_tool')
  if (!ellipseTool) { return }

  tool = ellipseTool.tool
})

it('activate ellipse tool on activate', () => {
  ellipse.activate(context)
  expect(context.registerTool).toHaveBeenCalledWith('ellipse_tool', tool)
})
