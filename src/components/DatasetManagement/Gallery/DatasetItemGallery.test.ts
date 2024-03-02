import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetVideoPayload, buildDatasetItemPayload, buildDatasetImagePayload, buildDatasetPayload } from 'test/unit/factories'
import { Gallery } from 'test/unit/stubs'

import DatasetItemGallery from '@/components/DatasetManagement/Gallery/DatasetItemGallery.vue'
import { DatasetItemPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = { Gallery }

let propsData: {
  dataset: DatasetPayload,
  readonly?: boolean
}
let store: ReturnType<typeof createTestStore>

const items: DatasetItemPayload[] = [
  buildDatasetItemPayload({
    dataset_image_id: 1,
    dataset_image: buildDatasetImagePayload({ id: 1 }),
    seq: 1
  }),
  buildDatasetItemPayload({
    dataset_video_id: 2,
    dataset_video: buildDatasetVideoPayload({ id: 2 }),
    seq: 2
  })
]

beforeEach(() => {
  store = createTestStore()
  propsData = {
    dataset: buildDatasetPayload()
  }

  store.commit('dataset/SET_DATASET_ITEMS', items)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetItemGallery, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const $route = { params: { datasetSlug: 'sfh', teamSlug: 'v7' } }
  const mocks = { $route }
  const wrapper = shallowMount(DatasetItemGallery, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('selects all when ctrl + a is pressed', () => {
  shallowMount(DatasetItemGallery, { localVue, propsData, store, stubs })
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }))
  expect(store.commit).toBeCalledWith('dataset/SET_SELECTED_ALL_ITEMS', true)
})

it('deselects all when Esc is pressed', () => {
  shallowMount(DatasetItemGallery, { localVue, propsData, store, stubs })
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  expect(store.commit).toBeCalledWith('dataset/SET_SELECTED_ALL_ITEMS', false)
})
