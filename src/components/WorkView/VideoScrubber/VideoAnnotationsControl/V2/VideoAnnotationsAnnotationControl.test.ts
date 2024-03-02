import { createLocalVue, Stubs, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildAnnotationTypePayload,
  buildDatasetPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { Transition } from 'test/unit/stubs'

import { Editor } from '@/engineV2/editor'
import { AnnotationManager } from '@/engineV2/managers'
import { View } from '@/engineV2/views/view'
import { WorkflowStagePayload } from '@/store/types'

import VideoAnnotationsAnnotationControl from './VideoAnnotationsAnnotationControl.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = { Transition }
let store: ReturnType<typeof createTestStore>
let propsData: { editor: Editor }
let view: View

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

const annotationTypes = [
  buildAnnotationTypePayload({ id: 1 }),
  buildAnnotationTypePayload({ id: 2 })
]

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        addListeners: jest.fn
      }
    })
  }
})

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [flask, tag])
  store.commit('aclass/SET_TYPES', annotationTypes)
  store.commit('workview/SET_DATASET', sfh)

  stage = buildWorkflowStagePayload({ id: 1 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

  const editor = createEditorV2(store)
  // @ts-ignore -> Mock view object, don't need to pass in props.
  view = new View(editor)
  view.annotationManager = new AnnotationManager(view)
  jest.spyOn(view, 'addListeners').mockReturnValue(undefined)
  editor.layout.setActiveView(view)

  view.editor = editor
  propsData = { editor }
})

it('matches snapshot when polygon annotation is selected', () => {
  const wrapper = shallowMount(VideoAnnotationsAnnotationControl, { localVue, propsData, store, stubs})
  expect(wrapper).toMatchSnapshot()
})
