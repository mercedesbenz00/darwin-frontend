import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { ImageManipulator } from 'test/unit/stubs'

import ImageSaturateManipulator from '@/components/WorkView/ImageManipulation/Manipulators/ImageSaturateManipulator.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
const stubs: Stubs = { ImageManipulator }

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ImageSaturateManipulator, { localVue, propsData: { editor }, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('set editor imageFilter when slider value changes', async () => {
  jest.spyOn(editor.activeView, 'setImageFilter').mockReturnValue(undefined)
  const wrapper = shallowMount(ImageSaturateManipulator, { localVue, propsData: { editor }, stubs })
  await wrapper.find('manipulator-slider-stub').vm.$emit('input', 40)
  expect(editor.activeView.setImageFilter).toBeCalledWith({
    ...DEFAULT_IMAGE_MANIPULATION_FILTER,
    saturate: 40
  })
})
