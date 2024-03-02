import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import DatasetManagementHeader from '@/components/Dataset/DatasetDetail/DatasetManagementHeader.vue'
import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload } from '@/store/types'
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)
localVue.directive('tooltip', () => {})
installCommonComponents(localVue)

let propsData: { dataset: DatasetPayload }
let store: ReturnType<typeof createTestStore>
let router: Router

beforeEach(() => {
  router = new Router
  store = createTestStore()

  propsData = {
    dataset: buildDatasetPayload({ work_prioritization: 'priority:desc' })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetManagementHeader, { localVue, propsData, router, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dataset item filter is set', async () => {
  router.replace({
    query: {
      item_names: ['1.jpg'],
      not_item_names: ['2.jpg'],
      has_comments: 'true',
      item_paths: ['/root'],
      not_item_paths: ['/temp'],
      sort: 'priority:asc',
      statuses: ['new'],
      not_statuses: ['annotate'],
      workflow_stage_ids: ['2'],
      not_workflow_stage_ids: ['3']
    }
  })
  const wrapper = shallowMount(DatasetManagementHeader, { localVue, propsData, router, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

describe('navigates with new query params', () => {
  beforeEach(() => {
    router.replace({
      query: {
        annotation_class_ids: [],
        not_annotation_class_ids: [],
        assignees: [],
        not_assignees: [],
        has_comments: 'false',
        item_paths: [],
        not_item_paths: [],
        sort: 'priority:asc',
        statuses: [],
        not_statuses: [],
        workflow_stage_ids: [],
        not_workflow_stage_ids: []
      }
    })
  })

  it('trigger navigation when sort option updated', async () => {
    jest.spyOn(router, 'push')
    const wrapper = shallowMount(DatasetManagementHeader, { localVue, propsData, router, store })
    await wrapper.find('v2-sort-control-stub').vm.$emit('change', {
      sortBy: 'priority', sortDirection: 'asc'
    })
    expect(router.push).toBeCalledWith({ query: { sort: 'priority:asc' } })
  })
})

describe('changes size step and layout mode', () => {
  it('changes size step when slider value updated', () => {
    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    const wrapper = shallowMount(DatasetManagementHeader, { localVue, propsData, router, store })
    wrapper.find('slider-stub').vm.$emit('input', 5)
    expect(store.commit).toBeCalledWith('dataset/SET_DATA_TAB_COLUMN_COUNT_V2', 5)
  })

  // TODO: Hiding this for now until the table row menu is done
  // it('changes view mode when segment value updated', () => {
  //   jest.spyOn(store, 'commit').mockReturnValue(undefined)
  //   const wrapper = shallowMount(
  //     DatasetManagementHeader,
  //     { localVue, mocks, propsData, store, stubs }
  //   )
  //   wrapper.find('segmented-control-stub').vm.$emit('tabChange', { index: 1 })
  //   expect(store.commit).toBeCalledWith('dataset/SET_DATA_TAB_VIEW_MODE', 1)
  // })
})
