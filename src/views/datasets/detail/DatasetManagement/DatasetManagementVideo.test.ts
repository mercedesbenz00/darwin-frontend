import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildDatasetDetailPayload,
  buildDatasetItemPayload,
  buildDatasetVideoPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import { DatasetItemStatus, DatasetPayload } from '@/store/types'
import DatasetManagementVideo from '@/views/datasets/detail/DatasetManagement/DatasetManagementVideo.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const v7 = buildTeamPayload({ id: 1 })
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

const videoItem = buildDatasetItemPayload({
  id: 1,
  dataset_video_id: 2,
  dataset_video: buildDatasetVideoPayload({ id: 2, original_filename: 'file.jpg' })
})
const items = [
  buildDatasetItemPayload({ id: 1, seq: 1, status: DatasetItemStatus.annotate }),
  buildDatasetItemPayload({ id: 2, seq: 2, status: DatasetItemStatus.uploading }),
  buildDatasetItemPayload({ id: 3, seq: 3, status: DatasetItemStatus.complete }),
  buildDatasetItemPayload({ id: 4, seq: 4, status: DatasetItemStatus.archived }),
  videoItem
]

const stubs: Stubs = { DatasetDetailLayout, 'router-view': true }

let store: ReturnType<typeof createTestStore>
let mocks: {
  $featureEnabled: () => boolean
  $route: { params: Object }
}
let propsData: { dataset: DatasetPayload }

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/SET_CURRENT_DATASET_LOADED')
  store.commit('dataset/SET_DATASET_ITEMS_LOADED')
  store.commit('dataset/SET_CURRENT_DATASET_VIDEO_ITEM', videoItem)
  mocks = {
    $featureEnabled: (): boolean => false,
    $route: {
      params: {
        datasetId: myDataset.id,
        datasetVideoId: videoItem.dataset_video_id
      }
    }
  }
  propsData = { dataset: myDataset }
})

it('matches the snapshot in dataset route', () => {
  const wrapper = shallowMount(DatasetManagementVideo, { localVue, mocks, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('matches the snapshot when dataset is public', () => {
  store.commit('team/SET_CURRENT_TEAM', null)
  propsData = { dataset: { ...myDataset, public: true } }
  const wrapper = shallowMount(DatasetManagementVideo, { localVue, mocks, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('should load dataset exports', () => {
  shallowMount(DatasetManagementVideo, { localVue, mocks, propsData, store, stubs })
  expect(store.dispatch).toBeCalledWith('dataset/getDatasetExports', { datasetId: 1 })
})

it('should load video info', () => {
  shallowMount(DatasetManagementVideo, { localVue, mocks, propsData, store, stubs })
  expect(store.dispatch).toBeCalledWith('dataset/getVideoItemInfo', {
    datasetId: 1,
    datasetVideoId: 2
  })
})

describe('in workflows 2.0', () => {
  beforeEach(() => {
    mocks.$featureEnabled = (): boolean => true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetManagementVideo, {
      localVue, mocks, propsData, store, stubs
    })

    expect(wrapper).toMatchSnapshot()
  })

  // disabled until part 2 of this PR
  /* it('renders v2 context menu', () => {
    const wrapper = shallowMount(DatasetManagementVideo, {
      localVue, mocks, propsData, store, stubs
    })

    expect(wrapper.find('v2-management-context-menu-stub').exists()).toBe(true)
  }) */
})
