import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import DatasetItemListItem from './DatasetItemListItem.vue'

let wrapper: Wrapper<Vue>

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const datasetItems = [
  buildV2DatasetItemPayload({
    dataset_id: 1,
    id: '123',
    archived: false,
    slot_types: [],
    slots: [],
    name: 'logo-123.png',
    path: '/',
    priority: 0,
    processing_status: DatasetItemStatus.new,
    status: DatasetItemStatus.new,
    uploads: [],

    current_workflow_id: null,
    current_workflow: null,

    inserted_at: '2022-05-08',
    updated_at: '2022-05-08'
  })
]

const propsData = {
  tableId: '123',
  data: datasetItems[0],
  row: 1
}

beforeEach(() => {
  store = createTestStore()

  const aclass1 = buildAnnotationClassPayload({ id: 1 })
  const aclass2 = buildAnnotationClassPayload({ id: 2, name: 'Desk' })

  store.commit('aclass/PUSH_CLASS', aclass1)
  store.commit('aclass/PUSH_CLASS', aclass2)
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)

  wrapper = shallowMount(DatasetItemListItem, { propsData, store, localVue })
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  expect(wrapper.exists()).toBeTruthy()
})

it('should match snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

it('should render proper date and file labels', () => {
  const labels = wrapper.findAll('.row__label')

  expect(labels.at(0).text()).toEqual('08 / 05 / 22')
  expect(labels.at(1).text()).toEqual('08 / 05 / 22')
  expect(labels.at(2).text()).toEqual('0 B')
})
