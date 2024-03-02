import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { ImageManipulator } from 'test/unit/stubs'

import InvertImageManipulator from '@/components/WorkView/ImageManipulation/Manipulators/InvertImageManipulator.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
const stubs: Stubs = { Checkbox: true, ImageManipulator }

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(InvertImageManipulator, { localVue, propsData: { editor }, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('set editor imageFilter when slider value changes', async () => {
  jest.spyOn(editor.activeView, 'setImageFilter').mockReturnValue(undefined)
  const wrapper = shallowMount(InvertImageManipulator, { localVue, propsData: { editor }, stubs })
  await wrapper.find('check-box-stub').vm.$emit('input', true)
  expect(editor.activeView.setImageFilter).toBeCalledWith({
    ...DEFAULT_IMAGE_MANIPULATION_FILTER,
    isInverted: true
  })
})
