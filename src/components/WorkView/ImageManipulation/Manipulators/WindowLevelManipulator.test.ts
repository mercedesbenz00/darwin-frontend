import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { ImageManipulator } from 'test/unit/stubs'

import WindowLevelManipulator from '@/components/WorkView/ImageManipulation/Manipulators/WindowLevelManipulator.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  editor: Editor
  autoRecompute?: boolean
}
const mocks = { $theme: createMockTheme() }
const stubs: Stubs = { ImageManipulator }

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WindowLevelManipulator, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('set editor imageFilter when slider value changes', async () => {
  jest.spyOn(editor.activeView, 'setImageFilter').mockReturnValue(undefined)
  const wrapper = shallowMount(WindowLevelManipulator, { localVue, mocks, propsData, stubs })
  await wrapper.find('manipulator-double-slider-stub').vm.$emit('input', [40, 2000])
  expect(editor.activeView.setImageFilter).toBeCalledWith({
    ...DEFAULT_IMAGE_MANIPULATION_FILTER,
    windowLevels: [40, 2000]
  })
})

it('reloads the histogram when the sidebar opens', async () => {
  jest.spyOn(editor.activeView, 'renderHistogram').mockReturnValue(undefined)
  const wrapper = shallowMount(WindowLevelManipulator, { localVue, mocks, propsData, stubs })
  await wrapper.setData({ hasStackedImageChange: true })
  expect(editor.activeView.renderHistogram).not.toBeCalled()
  await wrapper.setProps({ autoRecompute: true })
  expect(editor.activeView.renderHistogram).toBeCalled()
})
