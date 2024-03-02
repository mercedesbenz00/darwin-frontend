import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import VideoAnnotationsVideoControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsVideoControl.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }

const initEditor = (store: ReturnType<typeof createTestStore>) => {
  const editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  return editor
}

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsVideoControl, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
