import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { Route } from 'vue-router'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import OpenDataSidebar from '@/components/DatasetManagement/Sidebar/OpenDataSidebar.vue'
import { DatasetItemStatus, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let mocks: any
let propsData: { dataset: DatasetPayload }
let store: ReturnType<typeof initializeStore>

beforeEach(() => {
  store = initializeStore()
  const { dispatch } = store

  store.dispatch = jest.fn().mockImplementation((action: string, payload: any) => {
    if (action.startsWith('toast') || action === 'team/getMemberships') {
      return {}
    } else {
      return dispatch(action, payload)
    }
  })

  mocks = {
    $route: { name: 'DatasetManagementData', params: {}, query: {} },
    $router: { push: jest.fn() }
  }

  propsData = {
    dataset: buildDatasetPayload({ work_prioritization: 'priority:desc' })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dataset item filter is set', async () => {
  mocks.$route.query = {
    annotation_class_ids: ['1', '2'],
    not_annotation_class_ids: ['3'],
    sort: 'inserted_at:asc',
    statuses: ['new'],
    not_statuses: ['annotate']
  }
  const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

describe('navigates with new query params', () => {
  const routerPushed = (query: Route['query']) =>
    expect(mocks.$router.push).toBeCalledWith({
      query
    })

  beforeEach(() => {
    mocks.$route.query = {
      annotation_class_ids: [],
      not_annotation_class_ids: [],
      sort: 'inserted_at:asc',
      statuses: [],
      not_statuses: []
    }
  })

  it('trigger navigation when sort option updated', async () => {
    const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
    await wrapper.find('sort-control-stub').vm.$emit('change', { sortBy: 'inserted_at', sortDirection: 'asc' })
    routerPushed({ sort: 'inserted_at:asc' })
  })

  it('trigger navigation when positive status filter updated', async () => {
    const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
    wrapper.find('status-filter-stub').vm.$emit('update:positive-statuses', [DatasetItemStatus.annotate])
    await wrapper.find('status-filter-stub').vm.$emit('change')
    routerPushed({ statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when negative status filter updated', async () => {
    const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
    wrapper.find('status-filter-stub').vm.$emit('update:negative-statuses', [DatasetItemStatus.new])
    await wrapper.find('status-filter-stub').vm.$emit('change')
    routerPushed({ not_statuses: [DatasetItemStatus.new], sort: 'priority:desc' })
  })

  it('trigger navigation when positive class filter updated', async () => {
    const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
    wrapper.find('class-filter-stub').vm.$emit('update:positive-class-ids', [2])
    await wrapper.find('class-filter-stub').vm.$emit('change')
    routerPushed({ annotation_class_ids: ['2'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative class filter updated', async () => {
    const wrapper = shallowMount(OpenDataSidebar, { localVue, mocks, propsData, store })
    wrapper.find('class-filter-stub').vm.$emit('update:negative-class-ids', [2])
    await wrapper.find('class-filter-stub').vm.$emit('change')
    routerPushed({ not_annotation_class_ids: ['2'], sort: 'priority:desc' })
  })
})
