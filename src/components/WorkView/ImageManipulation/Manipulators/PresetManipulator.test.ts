import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import PresetManipulator from './PresetManipulator.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor
}

beforeEach(() => {
  store = createTestStore()
  const editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PresetManipulator, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
