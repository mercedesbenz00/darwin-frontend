import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import loadingDirective from '@/directives/loading'
import { LoadingStatus } from '@/store/types'

import ActionHistoryTrigger from './ActionHistoryTrigger.vue'

const localVue = createLocalVue()
localVue.directive('loading', loadingDirective)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const stubs = { VPopover }
const datasetItem = buildDatasetItemPayload({ id: 1 })

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ActionHistoryTrigger, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  const wrapper = shallowMount(ActionHistoryTrigger, { localVue, store, stubs })
  store.commit('workview/SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loading)
  expect(wrapper).toMatchSnapshot()
})

it('loads workflow actions when popover is opened', async () => {
  const wrapper = mount(ActionHistoryTrigger, { localVue, store, stubs })
  const icon = wrapper.find('.three-dot-button')
  await icon.trigger('click')
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadWorkflowActions', datasetItem)
})
