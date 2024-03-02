import { createLocalVue, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import Vuex from 'vuex'

import { buildFlaskStageVideoAnnotation } from 'test/unit/components/WorkView/VideoScrubber/utils'
import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import VideoAnnotationsItemAnnotation from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/VideoAnnotationsItemAnnotation.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  annotation: Annotation
  active: boolean
  position: number
  isSubkey: boolean
}
let provide: Object

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon', 'text'],
  datasets: [{ id: sfh.id }]
})

let annotation: Annotation

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [flask])
  store.commit('workview/SET_DATASET', sfh)
  setDefaultAnnotationTypes(store)
  editor = new Editor(new ItemManager(store), store)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)

  provide = {
    editor: ref(editor)
  }

  annotation = buildFlaskStageVideoAnnotation(editor, {
    classId: flask.id,
    data: {
      frames: {
        0: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
        },
        1: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 20, y: 20 }] }
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
    active: false,
    position: 0,
    isSubkey: false
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when annotation is selected', () => {
  annotation.select(false)
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when annotation is not visible', () => {
  annotation.hide(false)
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when annotation is active', () => {
  propsData.active = true
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper).toMatchSnapshot()
})

it('emits click on click main-keyframe', async () => {
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper.emitted().click).toBeUndefined()
  await wrapper.trigger('click')
  expect(wrapper.emitted().click).toHaveLength(1)
})

it('emits click on click sub-keyframe', async () => {
  propsData = {
    ...propsData,
    active: false,
    position: 5,
    isSubkey: true
  }
  const wrapper = shallowMount(
    VideoAnnotationsItemAnnotation,
    { localVue, propsData, store, provide }
  )
  expect(wrapper.emitted().click).toBeUndefined()
  await wrapper.trigger('click')
  expect(wrapper.emitted().click).toHaveLength(1)
})
