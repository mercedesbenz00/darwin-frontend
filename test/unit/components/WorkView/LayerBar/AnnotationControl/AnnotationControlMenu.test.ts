import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { flask } from 'test/unit/fixtures/annotation-class-payloads'

import AnnotationControlMenu from '@/components/WorkView/LayerBar/AnnotationControl/AnnotationControlMenu.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: { readonly?: boolean }

beforeEach(() => {
  store = createTestStore()
  propsData = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotationControlMenu, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(AnnotationControlMenu, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('refreshes the annotations visibility when annotations change', async () => {
  const wrapper = shallowMount(AnnotationControlMenu, { localVue, propsData, store })

  const stage = buildWorkflowStagePayload({ id: 1 })
  const annotation = buildStageAnnotationPayload({ workflow_stage_id: stage.id })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('aclass/SET_CLASSES', [flask])
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })

  await wrapper.vm.$nextTick()
  expect(store.dispatch).toBeCalledWith('workview/refreshAnnotationsVisibility')
})

it('does not show the "Delete all visible annotations" button if Workflows V2', () => {
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)

  const wrapper = shallowMount(AnnotationControlMenu, { localVue, propsData, store })
  expect(wrapper.find('delete-all-visible-annotations-stub').exists()).toBeFalsy()
})
