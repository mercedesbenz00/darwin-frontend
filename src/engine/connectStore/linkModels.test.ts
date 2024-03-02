import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildModelPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { ModelPayload } from '@/store/modules/neuralModel/types'
import { ModelType } from '@/utils/wind/types'

import { linkModels } from './linkModels'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  linkModels(store, editor)
})

it('workview/SET_AUTO_ANNOTATE_MODELS should trigger Editor.setPreselectedAutoAnnotateModel', () => {
  const models: ModelPayload[] = [
    buildModelPayload({
      id: 'model-1',
      team_id: 1,
      name: 'Model 1',
      status: [{ status: 'available', mode: '', latest_updated_at: new Date() }],
      type: ModelType.AutoAnnotation,
      tier: 'standard',
      url: 'example.com'
    })
  ]

  jest.spyOn(editor.activeView.onModelsChangedCallbacks, 'call')
  jest.spyOn(editor, 'setPreselectedAutoAnnotateModel')

  store.commit('workview/SET_AUTO_ANNOTATE_MODELS', models)

  expect(editor.activeView.onModelsChangedCallbacks.call)
    .toHaveBeenCalledWith(editor.autoAnnotateModels)
  expect(editor.setPreselectedAutoAnnotateModel).toHaveBeenCalled()
})
