import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetFolderPayload, buildDatasetPayload } from 'test/unit/factories'

import FolderTool from '@/components/DatasetManagement/Dialog/FileUploadDialog/FolderTool.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VTooltip, { defaultHtml: true })

let store: ReturnType<typeof createTestStore>

const folders = [
  buildDatasetFolderPayload({ path: '/', direct_item_count_filtered: 1 }),
  buildDatasetFolderPayload({ path: '/test', direct_item_count_filtered: 2 })
]

describe('FolderTool with V1', () => {
  beforeEach(() => {
    store = createTestStore()
    const dataset = buildDatasetPayload({ id: 1, name: 'Test' })

    store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
    store.commit('dataset/SET_DATASETS', [dataset])

    store.commit('dataset/SET_DATASET_FOLDERS', {
      datasetId: dataset.id,
      folders
    })

    store.commit('datasetUpload/SET_COMMON_PATH', '/current/path')
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FolderTool, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('FolderTool with V2', () => {
  beforeEach(() => {
    store = createTestStore()
    const dataset = buildDatasetPayload({
      id: 1,
      name: 'Test',
      version: 2
    })

    store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
    store.commit('dataset/SET_DATASETS', [dataset])

    store.commit('dataset/SET_DATASET_FOLDERS', {
      datasetId: dataset.id,
      folders
    })

    store.commit('datasetUpload/SET_COMMON_PATH', '/current/path')
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FolderTool, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
})
