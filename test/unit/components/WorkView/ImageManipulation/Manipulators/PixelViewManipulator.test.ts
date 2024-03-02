import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { ImageManipulator } from 'test/unit/stubs'
import { Mock } from 'test/unit/utils/storageMocks'

import PixelViewManipulator from '@/components/WorkView/ImageManipulation/Manipulators/PixelViewManipulator.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { LoadedImageWithTiles } from '@/engine/models'
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
  const wrapper = shallowMount(PixelViewManipulator, { localVue, propsData: { editor }, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('set editor isImageSmoothing on checkbox change', async () => {
  jest.spyOn(editor.activeView, 'setImageFilter').mockReturnValue(undefined)
  const wrapper = shallowMount(PixelViewManipulator, { localVue, propsData: { editor }, stubs })
  await wrapper.find('check-box-stub').vm.$emit('input', true)
  expect(editor.activeView.setImageFilter).toBeCalledWith({
    ...DEFAULT_IMAGE_MANIPULATION_FILTER,
    isImageSmoothing: false
  })
})

it('set user preferences for imageSmoothing on checkbox change for current file type', async () => {
  editor.loadedImage = <LoadedImageWithTiles>{
    originalFilename: 'test.jpg'
  }
  Object.defineProperty(window, 'localStorage', { value: new Mock() })

  const wrapper = shallowMount(PixelViewManipulator, { localVue, propsData: { editor }, stubs })
  await wrapper.find('check-box-stub').vm.$emit('input', true)

  expect(window.localStorage.getItem('isImageSmoothing:jpg')).toBe('off')

  await wrapper.find('check-box-stub').vm.$emit('input', false)

  expect(window.localStorage.getItem('isImageSmoothing:jpg')).toBe('on')
})
