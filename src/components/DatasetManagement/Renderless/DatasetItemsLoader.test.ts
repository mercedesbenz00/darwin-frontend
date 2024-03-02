import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import DatasetItemsLoader from '@/components/DatasetManagement/Renderless/DatasetItemsLoader'
import {
  DatasetItemFilter,
  DatasetItemStatus,
  DatasetItemType,
  DatasetPayload
} from '@/store/types'

const sfh = buildDatasetPayload()
const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: {
    name?: string
    params: {
      datasetVideoId?: string
      path?: string
    }
    hash?: string
    query: {}
  },
  $router: { push: Function }
}
let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  propsData = { dataset: sfh }
  mocks = {
    $route: { name: 'DatasetManagementData', params: {}, query: {} },
    $router: { push: jest.fn() }
  }
})

describe('on mount', () => {
  it('resolves and sets filter on root', () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees: [1] })
    shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    const expectedFilter: DatasetItemFilter = {
      path: '/',
      sort: { inserted_at: 'asc' },
      types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.splitVideo]
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilter', expectedFilter)
  })

  it('resolves and sets filter on video', () => {
    mocks.$route.params.datasetVideoId = '1'
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.annotate] })
    shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    const expectedFilter: DatasetItemFilter = {
      path: '/',
      sort: { inserted_at: 'asc' },
      types: [DatasetItemType.videoFrame],
      video_ids: [1]
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilter', expectedFilter)
  })

  it('resolves and sets filter on subfolder', () => {
    mocks.$route.params.path = 'foo'
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees: [1] })
    shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    const expectedFilter: DatasetItemFilter = {
      path: '/foo',
      sort: { inserted_at: 'asc' },
      types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.splitVideo]
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilter', expectedFilter)
  })

  it('resolves and sets filter on subfolder with special characters', () => {
    mocks.$route.params.path = 'foo'
    mocks.$route.hash = '#$%^&*()!@??'
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees: [1] })
    shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    const expectedFilter: DatasetItemFilter = {
      path: '/foo#$%^&*()!@??',
      sort: { inserted_at: 'asc' },
      types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.splitVideo]
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilter', expectedFilter)
  })
})

describe('on destroy', () => {
  it('resets filter', async () => {
    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.destroy()
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilter', {})
  })

  it('resets folders', async () => {
    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    jest.spyOn(store, 'commit')
    await wrapper.vm.$nextTick()
    await wrapper.destroy()
    expect(store.commit).toHaveBeenCalledWith('dataset/SET_DATASET_FOLDERS', {
      datasetId: sfh.id,
      folders: []
    })
  })

  it('stops polling', async () => {
    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.destroy()
    expect(store.dispatch).toHaveBeenCalledWith('dataset/stopLoadingAllDatasetItems', {
      datasetId: sfh.id
    })
  })
})

describe('on filter change', () => {
  it('starts polling on first change', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', {})

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    await wrapper.vm.$nextTick()

    expect(store.dispatch)
      .toHaveBeenCalledWith('dataset/loadAllDatasetItems', { datasetId: sfh.id })
  })

  it('restarts polling on subsequent changes', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.annotate] })
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/restartLoadingAllDatasetItems', {
      datasetId: sfh.id
    })
  })

  it('reloads counts', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.annotate] })
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetItemCountsThrottled', {
      dataset: sfh
    })
  })

  it('reloads folders', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', true)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.annotate] })
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetFoldersThrottled', {
      datasetId: sfh.id
    })
  })
})

describe('on folder view change', () => {
  it('restarts polling', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', false)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_FOLDER_ENABLED', true)
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/restartLoadingAllDatasetItems', {
      datasetId: sfh.id
    })
  })

  it('reloads counts', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', false)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_FOLDER_ENABLED', true)
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetItemCountsThrottled', {
      dataset: sfh
    })
  })

  it('reloads folders', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', false)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_FOLDER_ENABLED', true)
    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetFoldersThrottled', {
      datasetId: sfh.id
    })
  })

  it('redirects to root if on folder route when leaving folder mode', async () => {
    mocks.$route.name = 'DatasetManagementFolderData'
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', true)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_FOLDER_ENABLED', false)
    await wrapper.vm.$nextTick()

    expect(mocks.$router.push).toHaveBeenCalledWith({
      name: 'DatasetManagementData',
      params: {},
      query: {}
    })
  })

  it('does not redirect to root if on main route when leaving folder mode', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
    store.commit('dataset/SET_FOLDER_ENABLED', true)

    const wrapper = shallowMount(DatasetItemsLoader, { localVue, mocks, propsData, store })

    store.commit('dataset/SET_FOLDER_ENABLED', false)
    await wrapper.vm.$nextTick()

    expect(mocks.$router.push).not.toHaveBeenCalled()
  })
})
