import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemFilter, buildDatasetPayload } from 'test/unit/factories'

import WorkflowListItemHeader from '@/components/DatasetManagement/ListItem/ListItemHeader/WorkflowListItemHeader.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: { dataset: DatasetPayload }
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ work_prioritization: 'inserted_at:desc' })
  }
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowListItemHeader, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('commits new option when selected', () => {
  const mocks = {
    $route: { name: 'DatasetManagementData', params: {}, query: {} },
    $router: { push: jest.fn() }
  }
  store.commit(
    'dataset/SET_DATASET_ITEMS_FILTER',
    buildDatasetItemFilter({ sort: { priority: 'asc' } })
  )
  const wrapper = shallowMount(WorkflowListItemHeader, { localVue, mocks, propsData, store })
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  const clickEvent = { id: 'inserted_at', sortDirection: 'desc' }
  wrapper.find('.list-item-header__inserted_at').vm.$emit('click', clickEvent)
  expect(mocks.$router.push).toBeCalledWith({
    query: { sort: 'inserted_at:desc' }
  })
})
