import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import ImageManipulation from '@/components/WorkView/ImageManipulation/ImageManipulation.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor,
  isSidebarOpen: boolean
}

beforeEach(() => {
  store = createTestStore()
  const editor = new Editor(new ItemManager(store), store)
  propsData = {
    editor,
    isSidebarOpen: true
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ImageManipulation, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when sidebar is closed', () => {
  propsData.isSidebarOpen = false
  const wrapper = shallowMount(ImageManipulation, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
