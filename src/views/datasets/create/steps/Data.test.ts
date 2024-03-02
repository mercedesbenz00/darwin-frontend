import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, createFile } from 'test/unit/factories'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'
import { PickDatasetModal } from 'test/unit/stubs'

import { installCommonComponents } from '@/plugins/components'
import {
  DatasetPayload,
  DatasetItemUploadedItemPayload,
  DatasetUploadedItemsPayload
} from '@/store/types'
import Data from '@/views/datasets/create/steps/Data.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: { dataset: DatasetPayload }

const sfh = buildDatasetPayload({ id: 99, name: 'SFH', slug: 'sfh' })

const mocks = {
  $ga: { event: jest.fn() },
  $router: { push: jest.fn() },
  $toast: { warning: jest.fn() }
}

beforeEach(() => {
  mocks.$toast.warning.mockClear()
  store = createTestStore()
  propsData = { dataset: sfh }
})

const model = {
  continueButton: 'positivebutton-stub.dataset-data__continue',
  dropzone: 'dropzone-stub',
  openModalButton: 'secondarybutton-stub',
  pickDatasetModal: '.pick-dataset-modal-stub',
  confirmPickedDatasetButton: '.pick-dataset-modal-stub positivebutton-stub'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(Data, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('can fork an existing dataset into the current', async () => {
  const parent = buildDatasetPayload({ id: 2, thumbnails: [] })
  const child = buildDatasetPayload({ id: 3, thumbnails: [] })
  store.commit('dataset/SET_DATASETS', [parent, child])

  const stubs = {
    PickDatasetModal
  }

  propsData.dataset = child
  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store, stubs })

  // open dataset pick modal
  await wrapper.find(model.openModalButton).vm.$emit('click')
  expect(PickDatasetModal.methods.show).toHaveBeenCalledTimes(1)

  await wrapper.find(model.pickDatasetModal).vm.$emit('update:selected-dataset', parent)

  await wrapper.find(model.confirmPickedDatasetButton).vm.$emit('click')

  await wrapper.find(model.continueButton).vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('dataset/forkDataset', { parentId: 2, childId: 3 })

  await wrapper.vm.$nextTick()

  expect(mocks.$ga.event).toHaveBeenCalledWith('create_dataset', 'continue_step_2', 'success')
  expect(mocks.$router.push).toHaveBeenCalledWith({
    name: 'DatasetCreationInstructionsStep',
    params: { datasetId: '3' }
  })
})

it('can add data to current dataset', async () => {
  const file = createFile()
  jest.spyOn(store, 'commit')
  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store })

  const mockData: DatasetUploadedItemsPayload = {
    items: [{ dataset_item_id: 1, filename: file.name }],
    blocked_items: []
  }

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockImplementation((action) => {
    if (action === 'dataset/updateDatasetData') {
      return Promise.resolve({ data: mockData })
    }
    return Promise.resolve({})
  })

  store.commit('datasetUpload/ADD_FILES', [file])
  await wrapper.find(model.dropzone).vm.$emit('files-added', store.state.datasetUpload.files)
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('dataset/updateDatasetData', {
    datasetSlug: 'sfh',
    items: [{
      filename: file.name,
      path: undefined,
      tags: undefined
    }]
  })
  expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/startUpload')
  expect(store.commit).toHaveBeenCalledWith('datasetUpload/SET_DATASET_ID', sfh.id)
  expect(store.commit).toHaveBeenCalledWith('datasetUpload/SET_FILES_DATA', [{
    uploadFile: { file, data: expect.any(Object) },
    data: {
      datasetItemId: 1,
      signingURL: 'dataset_items/1/sign_upload'
    }
  }])
})

it(`shows nag dialog on ${outOfSubscribedStorageError.code}`, async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })
  store.commit('datasetUpload/ADD_FILES', [createFile('foo.png'), createFile('test.dcm')])

  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store })
  await wrapper.find(model.dropzone).vm.$emit('files-added', store.state.datasetUpload.files)
  await wrapper.vm.$nextTick()

  expect(store.state.billing.outOfStorageDialogShown).toBe(true)
})

it('dispatches error when there is one blocked item', async () => {
  store.commit('datasetUpload/ADD_FILES', [createFile('foo.png'), createFile('test.png')])
  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  const items: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 1, filename: 'foo.png' }
  ]
  const blockedItems: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 2, filename: 'test.png' }
  ]
  dispatch.mockResolvedValue({ data: { items: items, blocked_items: blockedItems } })

  await wrapper.find(model.dropzone).vm.$emit('files-added', store.state.datasetUpload.files)

  await flushPromises()
  expect(mocks.$toast.warning).toHaveBeenCalled()
})

it('dispatches error when there are 2 to 6 blocked items', async () => {
  store.commit('datasetUpload/ADD_FILES', [createFile('foo.png'), createFile('test.png'),
    createFile('test2.png')])
  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  const items: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 1, filename: 'foo.png' }
  ]
  const blockedItems: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 2, filename: 'test.png' },
    { dataset_item_id: 3, filename: 'test2.png' }
  ]
  dispatch.mockResolvedValue({ data: { items: items, blocked_items: blockedItems } })

  await wrapper.find(model.dropzone).vm.$emit('files-added', store.state.datasetUpload.files)

  await flushPromises()
  expect(mocks.$toast.warning).toHaveBeenCalled()
})

it('dispatches error when there are more than 6 blocked items', async () => {
  store.commit('datasetUpload/ADD_FILES', [createFile('foo.png'), createFile('test.png'),
    createFile('test2.png'), createFile('test3.png'), createFile('test4.png'),
    createFile('test5.png'), createFile('test6.png')])
  const wrapper = shallowMount(Data, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  const items: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 1, filename: 'foo.png' }
  ]
  const blockedItems: DatasetItemUploadedItemPayload[] = [
    { dataset_item_id: 2, filename: 'test.png' },
    { dataset_item_id: 3, filename: 'test2.png' },
    { dataset_item_id: 4, filename: 'test3.png' },
    { dataset_item_id: 5, filename: 'test4.png' },
    { dataset_item_id: 6, filename: 'test5.png' },
    { dataset_item_id: 7, filename: 'test6.png' }
  ]
  dispatch.mockResolvedValue({ data: { items: items, blocked_items: blockedItems } })

  await wrapper.find(model.dropzone).vm.$emit('files-added', store.state.datasetUpload.files)

  await flushPromises()
  expect(mocks.$toast.warning).toHaveBeenCalledWith({
    meta: {
      title: expect.stringContaining(
        'test.png, test2.png, test3.png, test4.png, test5.png and 1 more file'
      )
    }
  })
})
