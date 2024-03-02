import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  createFile
} from 'test/unit/factories'

import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import FileUploadDialogCore from '@/components/DatasetManagement/Dialog/FileUploadDialog/FileUploadDialogCore.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)
localVue.component('ModalV2', ModalV2)
localVue.component('ModalHeaderV2', ModalHeaderV2)
localVue.component('ModalHeaderTitleV2', ModalHeaderTitleV2)
localVue.component('ModalContentV2', ModalContentV2)
localVue.component('ModalFooterV2', ModalFooterV2)

const mocks = {
  $theme: createMockTheme(),
  $toast: {
    success: Function,
    warning: Function
  }
}

const models = {
  submitButton: 'custom-button-stub.submit-upload'
}

let propsData: { popupMode: boolean }

let store: ReturnType<typeof createTestStore>

describe('FileUploadDialog with V1', () => {
  beforeEach(() => {
    store = createTestStore()
    const dataset = buildDatasetPayload({ id: 1, name: 'Test' })

    store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
    store.commit('dataset/SET_DATASETS', [dataset])
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', dataset)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('FileUploadDialog with V2 and no popup mode', () => {
  beforeEach(() => {
    store = createTestStore()
    const file = createFile('foo.png')
    const dataset = buildDatasetPayload({ id: 1, name: 'Test', version: 2 })

    store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
    store.commit('dataset/SET_DATASETS', [dataset])
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', dataset)
    store.commit('datasetUpload/ADD_FILES', [file])
    propsData = { popupMode: false }

    jest.spyOn(store, 'dispatch').mockResolvedValue({})
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('If move path was set, update dataset items with paths when submit', async () => {
    store.commit('datasetUpload/SET_COMMON_PATH', '/current/path')
    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks, propsData })
    expect(wrapper.find(models.submitButton).attributes().disabled).toBeFalsy()
    await wrapper.find(models.submitButton).vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/moveV2ItemsToPath',
      expect.objectContaining({ filters: { select_all: true } })
    )
  })

  it('If tags was set, update  dataset items with tags when submit', async () => {
    store.commit('datasetUpload/SET_COMMON_PATH', '/current/path')
    const classes = [
      buildAnnotationClassPayload({ id: 1 }),
      buildAnnotationClassPayload({ id: 2 })
    ]
    store.commit('datasetUpload/SET_COMMON_TAG_CLASSES', classes)
    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks, propsData })
    expect(wrapper.find(models.submitButton).attributes().disabled).toBeFalsy()
    await wrapper.find(models.submitButton).vm.$emit('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/tagSelectedItemsV2',
      expect.objectContaining({ filters: { select_all: true } })
    )
  })
})

describe('FileUploadDialog with V2 and popup mode', () => {
  beforeEach(() => {
    store = createTestStore()
    const file = createFile('foo.png')
    const dataset = buildDatasetPayload({ id: 1, name: 'Test', version: 2 })

    store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
    store.commit('dataset/SET_DATASETS', [dataset])
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', dataset)
    store.commit('datasetUpload/ADD_FILES', [file])
    store.commit('datasetUpload/SET_COMMON_PATH', '/current/path')
    store.commit('datasetUpload/SET_COMMON_TAGS', ['a', 'b'])
    propsData = { popupMode: true }

    jest.spyOn(store, 'dispatch').mockResolvedValue({})
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('update dataset with path and tags when submit', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: { items: [], blocked_items: [] }})

    const wrapper = shallowMount(FileUploadDialogCore, { localVue, store, mocks, propsData })
    expect(wrapper.find(models.submitButton).attributes().disabled).toBeFalsy()
    await wrapper.find(models.submitButton).vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/updateDatasetDataV2',
      expect.objectContaining({
        datasetSlug: 'dataset',
        items: [{ file_name: 'foo.png', path: '/current/path', tags: ['a', 'b'] }]
      })
    )
  })
})
