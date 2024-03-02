import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetPayload } from 'test/unit/factories'

import WorkflowPagination from '@/components/WorkView/Pagination/WorkflowPagination.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DatasetItemCountsPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = { editor }

  const counts: DatasetItemCountsPayload = {
    item_count: 2345,
    commented_item_count: 0,
    unfiltered_item_count: 5678,
    status_counts: [],
    class_counts: []
  }
  store.commit('workview/SET_DATASET_ITEM_COUNTS', counts)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowPagination, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when feature enabled is true', () => {
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)

  const wrapper = shallowMount(WorkflowPagination, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('should exist', () => {
  const wrapper = shallowMount(WorkflowPagination, { localVue, propsData, store })
  expect(wrapper.exists()).toBeTruthy()
})

it('uses item count as page count', () => {
  const wrapper = shallowMount(WorkflowPagination, { localVue, propsData, store })
  expect(wrapper.find('chevron-pagination-stub').attributes('pagecount')).toEqual('2345')
})
