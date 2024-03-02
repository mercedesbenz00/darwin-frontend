import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildFlaskStageVideoAnnotation } from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildLoadedVideo
} from 'test/unit/factories'

import VideoAnnotationsKeyframeButton from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsKeyframeButton.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [flask])
  store.commit('workview/SET_DATASET', sfh)
  editor = new Editor(new ItemManager(store), store)
  const annotation = buildFlaskStageVideoAnnotation(editor)
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([annotation])
  propsData = { editor }
})

it('matches snapshot when current frame is keyframe', () => {
  editor.activeView.annotations[0].select(false)
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when current frame is not keyframe', () => {
  editor.activeView.annotations[0].select(false)
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 1 })
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no loaded video', () => {
  editor.activeView.annotations[0].select(false)
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('removes current selected keyframe on click if current frame is keyframe', async () => {
  editor.activeView.annotations[0].select(false)
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
  jest.spyOn(editor.activeView, 'deleteKeyFrame').mockReturnValue(undefined)
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
  expect(editor.activeView.deleteKeyFrame).toBeCalledWith(editor.activeView.annotations[0], 0)
})

it('creates a new keyframe on click if current frame is not keyframe', async () => {
  editor.activeView.annotations[0].select(false)
  editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 1 })
  jest.spyOn(editor.activeView, 'createKeyFrame').mockReturnValue(undefined)
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  wrapper.find('button').trigger('click')
  await wrapper.vm.$nextTick()
  expect(editor.activeView.createKeyFrame).toBeCalledWith(editor.activeView.annotations[0], 1)
})
