import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetVideoPayload } from 'test/unit/factories'
import { ListItem } from 'test/unit/stubs'

import DatasetItemListItem from '@/components/DatasetManagement/ListItem/DatasetItemListItem/V1/DatasetItemListItem.vue'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = {
  $featureEnabled: jest.fn().mockReturnValue(false),
  $route: { params: {}, query: {} }
}
const stubs = { ListItem }

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const propsData = { data: buildDatasetItemPayload() }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when uploading', () => {
  const propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.uploading }) }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when the item is video frames item', () => {
  const propsData = {
    data: buildDatasetItemPayload({
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({ id: 1 })
    })
  }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when the item is video item', () => {
  const propsData = {
    data: buildDatasetItemPayload({
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: true })
    })
  }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when archived', () => {
  const propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.archived }) }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when error', () => {
  const propsData = { data: buildDatasetItemPayload({ status: DatasetItemStatus.error }) }
  const wrapper = shallowMount(DatasetItemListItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
