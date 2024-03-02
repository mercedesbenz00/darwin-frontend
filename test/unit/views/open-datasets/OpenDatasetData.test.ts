import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildDatasetDetailPayload,
  buildDatasetItemPayload
} from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import { DatasetItemStatus } from '@/store/types'
import OpenDatasetData from '@/views/open-datasets/OpenDatasetData.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const myDataset = buildDatasetPayload({
  id: 1,
  name: 'My Dataset',
  slug: 'my-dataset',
  public: false,
  active: true,
  archived_at: null,
  archived: false,
  instructions: '',
  progress: 0.5,
  owner_id: 1,
  work_size: 20,
  thumbnails: [],
  num_classes: 3,
  num_annotations: 1000,
  num_images: 4,
  team_id: 1
})

const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })

const items = [
  buildDatasetItemPayload({ id: 1, seq: 1, status: DatasetItemStatus.annotate }),
  buildDatasetItemPayload({ id: 2, seq: 2, status: DatasetItemStatus.uploading }),
  buildDatasetItemPayload({ id: 3, seq: 3, status: DatasetItemStatus.complete }),
  buildDatasetItemPayload({ id: 4, seq: 4, status: DatasetItemStatus.archived })
]

const stubs: Stubs = { OpenDatasetDetailLayout: DatasetDetailLayout, 'router-view': true }

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches the snapshot in dataset route', () => {
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/SET_CURRENT_DATASET_LOADED')
  store.commit('dataset/SET_DATASET_ITEMS_LOADED')

  const mocks = { $route: { params: {} } }
  const propsData = { dataset: myDataset }
  const wrapper = shallowMount(OpenDatasetData, { localVue, mocks, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('matches the snapshot in dataset folder route', () => {
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/SET_CURRENT_DATASET_LOADED')
  store.commit('dataset/SET_DATASET_ITEMS_LOADED')

  const mocks = { $route: { params: { path: '/root' } } }
  const propsData = { dataset: myDataset }
  const wrapper = shallowMount(OpenDatasetData, { localVue, mocks, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})
