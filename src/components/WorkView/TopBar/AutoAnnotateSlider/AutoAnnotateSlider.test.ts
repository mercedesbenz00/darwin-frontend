import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import AutoAnnotateSlider from './AutoAnnotateSlider.vue'

const localVue = createLocalVue()
localVue.use(VTooltip)
localVue.use(Vuex)

const mocks = { $theme: createMockTheme() }

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  editor: Editor
}

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AutoAnnotateSlider, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('calls clicker_tool.set_threshold command', async () => {
  const wrapper = shallowMount(AutoAnnotateSlider, { localVue, mocks, propsData, store })
  jest.spyOn(editor, 'callCommand').mockReturnValue(undefined)
  await wrapper.find('slider-stub').vm.$emit('change', 0.5)
  expect(editor.callCommand).toHaveBeenCalledWith('clicker_tool.set_threshold', 0.5)
})
