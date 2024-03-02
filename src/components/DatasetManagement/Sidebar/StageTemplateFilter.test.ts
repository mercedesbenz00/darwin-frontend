import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'
import { initializeARTemplate } from 'test/unit/factories/helpers'
import { emitRootStub, nthEmitted, rootStubProps } from 'test/unit/testHelpers'

import StageTemplateFilter from '@/components/DatasetManagement/Sidebar/StageTemplateFilter.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  dataset: DatasetPayload
  positiveStageTemplateIds?: number[]
}
let store: ReturnType<typeof createTestStore>

const sfh = buildDatasetPayload({ id: 5, default_workflow_template_id: 9 })
const template = initializeARTemplate(sfh)
template.id = 9

beforeEach(() => {
  propsData = {
    dataset: sfh,
    positiveStageTemplateIds: []
  }
  store = createTestStore()
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', { id: 5 })
  store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', template)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('sets correct props on child', () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData, store })
  expect(rootStubProps(wrapper, 'workflowTemplate')).toEqual(template)
})

it('adds positive stage template to filter', async () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData, store })
  await emitRootStub(wrapper, 'change', { positiveStageTemplateIds: [5] })
  expect(nthEmitted(wrapper, 'update:positive-stage-template-ids', 0)).toEqual([[5]])
  expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ positiveStageTemplateIds: [5] }])

  await emitRootStub(wrapper, 'change', { positiveStageTemplateIds: [] })
  expect(nthEmitted(wrapper, 'update:positive-stage-template-ids', 1)).toEqual([[]])
  expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveStageTemplateIds: [] }])
})

it('adds negative stage template to filter', async () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData, store })
  await emitRootStub(wrapper, 'change', { negativeStageTemplateIds: [5] })
  expect(nthEmitted(wrapper, 'update:negative-stage-template-ids', 0)).toEqual([[5]])
  expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ negativeStageTemplateIds: [5] }])

  await emitRootStub(wrapper, 'change', { negativeStageTemplateIds: [] })
  expect(nthEmitted(wrapper, 'update:negative-stage-template-ids', 1)).toEqual([[]])
  expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ negativeStageTemplateIds: [] }])
})
