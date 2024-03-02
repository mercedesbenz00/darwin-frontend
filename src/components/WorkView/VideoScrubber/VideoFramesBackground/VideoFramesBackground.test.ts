import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetVideoPayload,
  buildLoadedFrame,
  buildVideoFramePayload,
  buildLoadedVideo
} from 'test/unit/factories'

import VideoFramesBackground from '@/components/WorkView/VideoScrubber/VideoFramesBackground/VideoFramesBackground.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const mockVideoFramesBackgroundEngine = {
  setCanvas: jest.fn(),
  setFrames: jest.fn(),
  setFramesCount: jest.fn(),
  setFrameLineWidth: jest.fn(),
  setHeight: jest.fn(),
  markFrameAsLoaded: jest.fn()
}

jest.mock('@/engine/utils', () => ({
  loadHqFrame: jest.fn().mockResolvedValue(null),
  loadLqFrame: jest.fn().mockResolvedValue(null),
  getWindowLevelsRange: jest.fn(),
  getCSSFilterString: jest.fn()
}))

jest.mock('@/components/WorkView/VideoScrubber/VideoFramesBackground/VideoFramesBackgroundEngine', () => ({
  VideoFramesBackgroundEngine: jest.fn().mockImplementation(() => mockVideoFramesBackgroundEngine)
}))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  height: number
  editor: Editor
}
const datasetVideo = buildDatasetVideoPayload({ id: 1, total_frames: 1 })
const datasetItem = buildDatasetItemPayload({
  dataset_video_id: datasetVideo.id,
  dataset_video: datasetVideo
})
const loadedFrames = [buildVideoFramePayload()]
const frames = { 0: buildLoadedFrame({ hqUrl: 'hq-url', lqUrl: 'lq-url', seq: 0 }) }

beforeEach(() => {
  store = createTestStore()
  const itemManager = new ItemManager(store)
  jest.spyOn(itemManager, 'loadItem').mockResolvedValue({ data: buildLoadedVideo() })
  const editor = new Editor(itemManager, store)
  propsData = {
    height: 100,
    editor
  }
  store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 5)
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
  store.commit('workview/PUSH_LOADED_VIDEO', {
    payload: datasetVideo,
    loadedFrames
  })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoFramesBackground, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when currentLoadedVideo is not defined', () => {
  store.commit('workview/SET_SELECTED_DATASET_ITEM', null)
  const wrapper = shallowMount(VideoFramesBackground, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('should setup canvas when currentLoadedVideo is set', async () => {
  store.commit('workview/SET_SELECTED_DATASET_ITEM', null)
  const wrapper = shallowMount(VideoFramesBackground, { localVue, propsData, store })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
  await wrapper.vm.$nextTick()
  expect(mockVideoFramesBackgroundEngine.setCanvas)
    .toHaveBeenCalledWith(expect.any(HTMLCanvasElement))
})

it('should setup canvas frames on load', () => {
  shallowMount(VideoFramesBackground, { localVue, propsData, store })
  expect(mockVideoFramesBackgroundEngine.setFrames).toHaveBeenCalledWith(frames)
})

it('should setup canvas frameLineWidth on load or on frameLineWidth change', async () => {
  const wrapper = shallowMount(VideoFramesBackground, { localVue, propsData, store })
  expect(mockVideoFramesBackgroundEngine.setFrameLineWidth).toHaveBeenCalledWith(5)
  store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 10)
  await wrapper.vm.$nextTick()
  expect(mockVideoFramesBackgroundEngine.setFrameLineWidth).toHaveBeenCalledWith(10)
})

it('should setup canvas height on load or on height prop change', async () => {
  const wrapper = shallowMount(VideoFramesBackground, { localVue, propsData, store })
  expect(mockVideoFramesBackgroundEngine.setHeight).toHaveBeenCalledWith(100)
  await wrapper.setProps({ height: 200 })
  expect(mockVideoFramesBackgroundEngine.setHeight).toHaveBeenCalledWith(200)
})

it('should call markFrameAsLoaded on views frame loaded event', async () => {
  shallowMount(VideoFramesBackground, { localVue, propsData, store })

  propsData.editor.activeView.jumpToFrame(1)

  await flushPromises()

  expect(mockVideoFramesBackgroundEngine.markFrameAsLoaded).toHaveBeenCalledWith(1)
})
