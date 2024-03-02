import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload
} from 'test/unit/factories'

import ToolModelSelection from '@/components/WorkView/ToolModelSelection/ToolModelSelection.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers/itemManager'
import { ModelType, RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor,
  models: RunningSessionPayload[]
}

it('resets tool if no auto annotate models exist in store', async () => {
  store = createTestStore()

  const editor = new Editor(new ItemManager(store), store)

  const trainedModel = buildTrainedModelPayload({
    model_template: buildModelTemplatePayload({
      type: ModelType.AutoAnnotation
    })
  })

  const runningSession = buildRunningSessionPayload({
    trained_model_id: trainedModel.id
  })

  store.state.neuralModel.trainedModels = [trainedModel]

  propsData = {
    editor,
    models: [
      runningSession
    ]
  }

  const sfh = buildDatasetPayload({ id: 1 })
  const plugins = editor.pluginManager.pluginsForDataset(sfh, [])
  editor.installAllPlugins(plugins)
  editor.toolManager.activateTool('edit_tool')

  const wrapper = shallowMount(ToolModelSelection, { localVue, propsData, store })
  await wrapper.vm.$nextTick()

  jest.spyOn(editor.activeView.annotationsLayer, 'changed').mockReturnValue()
  store.commit('workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID', runningSession.id)
  await wrapper.vm.$nextTick()

  expect(editor.activeView.annotationsLayer.changed).toHaveBeenCalled()
})
