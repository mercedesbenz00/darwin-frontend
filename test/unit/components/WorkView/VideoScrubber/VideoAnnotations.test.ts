import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildFlaskStageVideoAnnotation,
  buildTagStageVideoAnnotation
} from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildCommentThread,
  buildDatasetPayload,
  buildLoadedVideo,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { getFakeMouseEvent } from 'test/unit/factories/buildFakeMouseEvent'

import VideoAnnotations from '@/components/WorkView/VideoScrubber/VideoAnnotations.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }

let flaskAnnotation: Annotation
let tagAnnotation: Annotation
let stage: WorkflowStagePayload

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})
const tag = buildAnnotationClassPayload({
  id: 2,
  name: 'tag',
  annotation_types: ['tag'],
  datasets: [{ id: sfh.id }]
})

beforeEach(() => {
  store = createTestStore()
  stage = buildWorkflowStagePayload({ id: 1 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
})

describe('without comments', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES', [flask, tag])
    store.commit('workview/SET_DATASET', sfh)
    editor = new Editor(new ItemManager(store), store)
    flaskAnnotation = buildFlaskStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 2 })
    tagAnnotation = buildTagStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 1 })

    editor.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
    editor.activeView.annotationManager.annotationsIds = [flaskAnnotation.id, tagAnnotation.id]
    editor.activeView.annotationManager.annotationsMap = {
      [flaskAnnotation.id]: flaskAnnotation,
      [tagAnnotation.id]: tagAnnotation
    }
    propsData = { editor }
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(VideoAnnotations, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('jumps to the frame when you mousedown in the empty region', async () => {
    const wrapper = shallowMount(VideoAnnotations, { localVue, propsData, store })
    jest.spyOn(editor, 'jumpToFrame')
    jest.spyOn(store, 'commit').mockReturnValue(undefined)

    const mousedownEvent = getFakeMouseEvent('mousedown', { clientX: 25 })
    await wrapper.find('.video-annotations__items').element.dispatchEvent(mousedownEvent)
    expect(store.commit).toBeCalledWith('workview/DESELECT_ALL_ANNOTATIONS')
    expect(editor.jumpToFrame).toBeCalledWith(6)
  })

  it('jumps to the frame when you mouse move in the empty region', async () => {
    const wrapper = shallowMount(VideoAnnotations, { localVue, propsData, store })
    jest.spyOn(editor, 'jumpToFrame')
    jest.spyOn(store, 'commit').mockReturnValue(undefined)

    const mousedownEvent = getFakeMouseEvent('mousedown', { clientX: 25 })
    await wrapper.find('.video-annotations__items').element.dispatchEvent(mousedownEvent)
    const mousemoveEvent = getFakeMouseEvent('mousemove', { clientX: 30 })
    await wrapper.find('.video-annotations__items').element.dispatchEvent(mousemoveEvent)
    expect(editor.jumpToFrame).toBeCalledWith(7)
  })
})

describe('with comments', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES', [flask, tag])
    store.commit('workview/SET_DATASET', sfh)

    store.commit('comment/SET_THREADS', [
      buildCommentThread({ id: 1, frame_index: 10 }),
      buildCommentThread({ id: 2, frame_index: 14 })
    ])
    editor = new Editor(new ItemManager(store), store)
    flaskAnnotation = buildFlaskStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 2 })
    tagAnnotation = buildTagStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 1 })

    editor.loadedVideo = buildLoadedVideo({
      id: 1,
      currentFrameIndex: 10,
      frames: {
        10: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: null,
          lqData: null,
          hqDataLoaded: false,
          lqDataLoaded: false
        },
        14: {
          seq: 2,
          hqUrl: 'hqurl1',
          lqUrl: 'lqurl1',
          hqData: null,
          lqData: null,
          hqDataLoaded: false,
          lqDataLoaded: false
        }
      }
    })
    editor.activeView.annotationManager.annotationsIds = [flaskAnnotation.id, tagAnnotation.id]
    editor.activeView.annotationManager.annotationsMap = {
      [flaskAnnotation.id]: flaskAnnotation,
      [tagAnnotation.id]: tagAnnotation
    }
    propsData = { editor }
  })

  it('matches the snapshot', () => {
    const wrapper = shallowMount(VideoAnnotations, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.findAll('video-comment-thread-indicator-stub')).toHaveLength(2)
  })
})
