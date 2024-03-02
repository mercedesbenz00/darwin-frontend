import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetPayload,
  buildLoadedVideo
} from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import VideoAnnotationsPagination from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsPagination.vue'
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
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsPagination, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when feature enabled is true', () => {
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const wrapper = shallowMount(VideoAnnotationsPagination, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('select next frame when next is clicked', async () => {
  jest.spyOn(editor, 'jumpToFrame')
  const wrapper = shallowMount(VideoAnnotationsPagination, { localVue, propsData, store })
  emitRootStub(wrapper, 'next')
  await wrapper.vm.$nextTick()
  expect(editor.jumpToFrame).toBeCalledWith(1)
})

it('select previous frame when prev is clicked', async () => {
  jest.spyOn(editor, 'jumpToFrame')
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 1 })
  const wrapper = shallowMount(VideoAnnotationsPagination, { localVue, propsData, store })
  emitRootStub(wrapper, 'prev')
  await wrapper.vm.$nextTick()
  expect(editor.jumpToFrame).toBeCalledWith(0)
})

it('jump to frame when page is selected', async () => {
  jest.spyOn(editor, 'jumpToFrame')
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
  const wrapper = shallowMount(VideoAnnotationsPagination, { localVue, propsData, store })
  emitRootStub(wrapper, 'page', 2)
  await wrapper.vm.$nextTick()
  expect(editor.jumpToFrame).toBeCalledWith(1)
})
