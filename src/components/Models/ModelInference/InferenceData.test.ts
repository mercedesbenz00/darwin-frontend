import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainingClass } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { InferenceResult } from '@/engineCommon/backend'
import { installCommonComponents } from '@/plugins/components'
import { TrainedModelPayload } from '@/store/types'

import InferenceData from './InferenceData.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: {
  classes?: TrainedModelPayload['classes']
  imageData: string
  inferenceResults?: InferenceResult[]
  mode: 'image' | 'video'
}
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  propsData = {
    classes: [],
    imageData: 'fooBase64',
    inferenceResults: [],
    mode: 'image'
  }

  editor = new Editor(new ItemManager(store), store)
  editor.init(true)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(InferenceData, {
    localVue,
    propsData,
    store,
    provide: { editor: { value: editor } }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with annotations', () => {
  propsData.classes = [
    buildTrainingClass({ id: '1', name: 'Foo', type: 'polygon' }),
    buildTrainingClass({ id: '2', name: 'Bar', type: 'bounding_box' })
  ]

  propsData.inferenceResults = [
    { label: 'Foo', path: [] },
    { label: 'Foo', path: [] },
    { label: 'Bar', path: [] }
  ]

  const wrapper = shallowMount(InferenceData, {
    localVue,
    propsData,
    store,
    provide: { editor: { value: editor } }
  })
  expect(wrapper).toMatchSnapshot()
})
