import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildFlaskStageVideoAnnotation } from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'
import { getFakeMouseEvent } from 'test/unit/factories/buildFakeMouseEvent'

import VideoAnnotationsItemKeyframe from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/VideoAnnotationsItemKeyframe.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  annotation: Annotation
  keyframeIndex: number
  position: number
  isSubkey: boolean
}

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
  const annotation = buildFlaskStageVideoAnnotation(editor, {
    data: {
      frames: {
        0: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] },
          position: 1,
          isSubkey: false
        },
        1: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 20, y: 20 }] },
          position: 1,
          isSubkey: false
        }
      },
      sub_frames: {
        1: {
          keyframe: true,
          text: { text: 'Text1' }
        },
        5: {
          keyframe: true,
          text: { text: 'Text2' }
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    }
  })
  editor.activeView.annotationManager.annotationsMap = {
    [annotation.id]: annotation
  }
  propsData = {
    annotation: annotation,
    keyframeIndex: 0,
    position: 0,
    isSubkey: false
  }
})

it('matches snapshot when keyframeIndex is 0', () => {
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when keyframeIndex is 5', () => {
  propsData = {
    ...propsData,
    keyframeIndex: 5,
    position: 1,
    isSubkey: true
  }
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when keyframeIndex is 10', () => {
  propsData.keyframeIndex = 10
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', async () => {
  propsData.keyframeIndex = 10
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  await wrapper.trigger('mouseenter')
  expect(wrapper).toMatchSnapshot()
})

it('emits select when click main keyframe', async () => {
  propsData.keyframeIndex = 10
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  const clickEvent = getFakeMouseEvent('click', {})
  await wrapper.element.dispatchEvent(clickEvent)
  expect(wrapper.emitted().select).toHaveLength(1)
})

it('emits select when click sub keyframe', async () => {
  propsData = {
    ...propsData,
    keyframeIndex: 10,
    position: 1,
    isSubkey: true
  }
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  const clickEvent = getFakeMouseEvent('click', {})
  await wrapper.element.dispatchEvent(clickEvent)
  expect(wrapper.emitted().select).toHaveLength(1)
})

it('emits delete when right click', async () => {
  propsData.keyframeIndex = 10
  const wrapper = shallowMount(
    VideoAnnotationsItemKeyframe,
    { localVue, propsData, store }
  )
  await wrapper.trigger('contextmenu')
  expect(wrapper.emitted().delete).toHaveLength(1)
})
