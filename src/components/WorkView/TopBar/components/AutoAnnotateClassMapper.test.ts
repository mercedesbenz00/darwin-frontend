import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import { buildRunningSessionPayload, buildTrainedModelPayload } from 'test/unit/factories'

import AutoAnnotateClassMapper from '@/components/WorkView/TopBar/components/AutoAnnotateClassMapper.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)

const SecondaryButton = localVue.extend({
  props: ['to'],
  template: '<a class="primary-button"><slot/></a>'
})

let editor: Editor

let propsData: {
  editor: Editor
}

let stubs: Stubs

// Store only gets read, so it can be shared between tests
const store = createTestStore()

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(AutoAnnotateClassMapper, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when mapped', () => {
  beforeEach(() => {
    const trainedModel = buildTrainedModelPayload()
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id

    editor = new Editor(new ItemManager(store), store)
    propsData = { editor }
    stubs = { SecondaryButton }
  })

  itMatchesSnapshot()
})
