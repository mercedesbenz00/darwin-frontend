import { createLocalVue, Stubs, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildFlaskStageVideoAnnotation,
  buildTagStageVideoAnnotation
} from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { Transition } from 'test/unit/stubs'

import VideoAnnotationsAnnotationControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsAnnotationControl.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = { Transition }
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
  store.commit('aclass/SET_CLASSES', [flask, tag])
  store.commit('workview/SET_DATASET', sfh)

  stage = buildWorkflowStagePayload({ id: 1 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

  editor = new Editor(new ItemManager(store), store)
  flaskAnnotation = buildFlaskStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 2 })
  tagAnnotation = buildTagStageVideoAnnotation(editor, { workflowStageId: stage.id, zIndex: 1 })
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get').mockReturnValue([
    flaskAnnotation,
    tagAnnotation
  ])

  propsData = { editor }
})

it('matches snapshot when polygon annotation is selected', () => {
  flaskAnnotation.select(false)
  const wrapper = shallowMount(VideoAnnotationsAnnotationControl, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when tag annotation is selected', () => {
  tagAnnotation.select(false)
  const wrapper = shallowMount(VideoAnnotationsAnnotationControl, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('updates interpolated flag when switch button is clicked', async () => {
  flaskAnnotation.select(false)
  jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)
  const wrapper = shallowMount(VideoAnnotationsAnnotationControl, { localVue, propsData, store, stubs })
  await wrapper.find('switch-button-stub').vm.$emit('input', true)
  expect(editor.actionManager.do).toBeCalled()
})

it('removes annotation when trash is clicked', async () => {
  editor.activeView.annotations[0].select(false)
  jest.spyOn(editor.activeView, 'removeAnnotation').mockResolvedValue(undefined)
  const wrapper = shallowMount(VideoAnnotationsAnnotationControl, { localVue, propsData, store, stubs })
  await wrapper.find('button.annotation-control__trash').trigger('click')
  await wrapper.vm.$nextTick()
  expect(editor.activeView.removeAnnotation).toBeCalledWith(editor.selectedAnnotation)
})
