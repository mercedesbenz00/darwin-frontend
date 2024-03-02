import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import FileItem from '@/components/DatasetManagement/Dialog/FileUploadDialog/FileItem.vue'
import { UploadFile } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const file = new File([], 'test.txt')

const uploadValue: UploadFile = {
  data: {
    category: 'image',
    setId: 1,
    signingURL: null,
    status: 'added',
    sentBytes: 0,
    totalBytes: 10
  },
  file: file
}

let propsData: {
  value: UploadFile
}

let store: ReturnType<typeof createTestStore>

describe('without VOLUMES_V2 feature flag', () => {
  global.URL.createObjectURL = jest.fn()

  beforeEach(() => {
    store = createTestStore()
    store.commit('features/SET_FEATURES', [{ name: 'VOLUMES_V2', enabled: false }])
    propsData = { value: uploadValue }
  })

  it('matches snapshot', () => {
    const wrapper = mount(FileItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with VOLUMES_V2 feature flag', () => {
  beforeEach(() => {
    store = createTestStore()
    store.commit('features/SET_FEATURES', [{ name: 'VOLUMES_V2', enabled: true }])
    propsData = { value: uploadValue }
  })

  it('matches snapshot', () => {
    const wrapper = mount(FileItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
