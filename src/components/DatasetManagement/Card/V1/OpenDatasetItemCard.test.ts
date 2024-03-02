import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetVideoPayload } from 'test/unit/factories'
import { Card } from 'test/unit/stubs'

import OpenDatasetItemCard from '@/components/DatasetManagement/Card/V1/OpenDatasetItemCard.vue'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = { Card }

let store: ReturnType<typeof createTestStore>
const mocks = {
  $featureEnabled: () => true,
  $route: { params: {}, query: {} }
}

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const propsData = { data: buildDatasetItemPayload(), urlPrefix: 'v7/test-open' }
  const wrapper = shallowMount(OpenDatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when uploading', () => {
  const propsData = {
    data: buildDatasetItemPayload({ status: DatasetItemStatus.uploading }),
    urlPrefix: 'v7/test-open'
  }
  const wrapper = shallowMount(OpenDatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when the item is split video', () => {
  const propsData = {
    data: buildDatasetItemPayload({
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: false })
    }),
    urlPrefix: 'v7/test-open'
  }
  const wrapper = shallowMount(OpenDatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when the item is playback video', () => {
  const propsData = {
    data: buildDatasetItemPayload({
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: true })
    }),
    urlPrefix: 'v7/test-open'
  }
  const wrapper = shallowMount(OpenDatasetItemCard, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
