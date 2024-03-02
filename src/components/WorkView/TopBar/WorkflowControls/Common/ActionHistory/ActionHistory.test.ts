import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildWorkflowActionPayload, buildDatasetItemPayload } from 'test/unit/factories'

import { LoadingStatus } from '@/store/types'

import ActionHistory from './ActionHistory.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const datasetItem = buildDatasetItemPayload({ id: 1 })
const actions = [
  buildWorkflowActionPayload({
    id: 1,
    workflow_id: 1,
    workflow_template_id: 1,
    workflow_template_name: 'Default (A > R)'
  }),
  buildWorkflowActionPayload({
    id: 2,
    workflow_id: 1,
    workflow_template_id: 1,
    workflow_template_name: 'Default (A > R)'
  }),
  buildWorkflowActionPayload({
    id: 3,
    workflow_id: 1,
    workflow_template_id: 1,
    workflow_template_name: 'Default (A > R)'
  }),
  buildWorkflowActionPayload({
    id: 4,
    workflow_id: 2,
    workflow_template_id: 2,
    workflow_template_name: 'Special (AA > R)'
  }),
  buildWorkflowActionPayload({
    id: 5,
    workflow_id: 2,
    workflow_template_id: 2,
    workflow_template_name: 'Special (AA > R)'
  }),
  buildWorkflowActionPayload({
    id: 6,
    workflow_id: 3,
    workflow_template_id: 2,
    workflow_template_name: 'Special (AA > R)'
  }),
  buildWorkflowActionPayload({
    id: 7,
    workflow_id: 3,
    workflow_template_id: 2,
    workflow_template_name: 'Special (AA > R)'
  })
]

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
  store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem, actions })
})

it('matches snapshot when no actions', () => {
  store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem, actions: [] })
  const wrapper = shallowMount(ActionHistory, { localVue, store })
  store.commit('workview/SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loaded)
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot', () => {
  const wrapper = mount(ActionHistory, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders one workflow group per workflow in history', () => {
  const wrapper = shallowMount(ActionHistory, { localVue, store })
  expect(wrapper.findAll('.action-history__workflow').length).toEqual(3)
})

it('renders one item per action in workflow', () => {
  const wrapper = mount(ActionHistory, { localVue, store })
  expect(
    wrapper
      .findAll('.action-history__actions')
      .at(0)
      .findAll('tbody tr')
      .length
  ).toEqual(3)

  expect(
    wrapper
      .findAll('.action-history__actions')
      .at(1)
      .findAll('tbody tr')
      .length
  ).toEqual(2)

  expect(
    wrapper
      .findAll('.action-history__actions')
      .at(2)
      .findAll('tbody tr')
      .length
  ).toEqual(2)
})
