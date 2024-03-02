import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import VideoAnnotationsPlayButton from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsPlayButton.vue'
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

it('matches the snapshot when paused', () => {
  editor.activeView.isPlaying = false
  const wrapper = shallowMount(VideoAnnotationsPlayButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches the snapshot when playing', () => {
  editor.activeView.isPlaying = true
  const wrapper = shallowMount(VideoAnnotationsPlayButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('play video on click when paused', async () => {
  editor.activeView.isPlaying = false
  jest.spyOn(editor, 'playVideo').mockResolvedValue([])
  const wrapper = shallowMount(VideoAnnotationsPlayButton, { localVue, propsData })
  wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
  expect(editor.playVideo).toHaveBeenCalled()
})

it('pause video on click when playing', async () => {
  editor.activeView.isPlaying = true
  jest.spyOn(editor, 'stopVideo').mockReturnValue([] as any)
  const wrapper = shallowMount(VideoAnnotationsPlayButton, { localVue, propsData })
  wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
  expect(editor.stopVideo).toHaveBeenCalled()
})
