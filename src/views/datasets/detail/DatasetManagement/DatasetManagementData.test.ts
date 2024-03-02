import { EventEmitter } from 'events'

import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vue from 'vue'
import { NavigationGuard, Route } from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildDatasetDetailPayload,
  buildDatasetItemPayload,
  buildTeamPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import { DatasetItemStatus, DatasetPayload, V2DatasetItemPayload } from '@/store/types'
import { Socket } from '@/utils'
import DatasetManagementData from '@/views/datasets/detail/DatasetManagement/DatasetManagementData.vue'

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
const items = [
  buildDatasetItemPayload({ id: 1, seq: 1, status: DatasetItemStatus.annotate }),
  buildDatasetItemPayload({ id: 2, seq: 2, status: DatasetItemStatus.uploading }),
  buildDatasetItemPayload({ id: 3, seq: 3, status: DatasetItemStatus.complete }),
  buildDatasetItemPayload({ id: 4, seq: 4, status: DatasetItemStatus.archived })
]

let mocks: {
  $featureEnabled: () => boolean
  $router: {
    beforeEach: jest.Mock,
    currentRoute: Route
  }
  $route: Route
}
let beforeEachMock: jest.Mock
let currentRouteMock: Route
let propsData: { dataset: DatasetPayload }
const stubs: Stubs = { DatasetDetailLayout, 'router-view': true }
let store: ReturnType<typeof createTestStore>

const expectLastBreadcrumbName = (wrapper: Wrapper<Vue>, name: string): void => {
  const vm = wrapper.vm as any
  const breadCrumbs = vm.breadCrumbs
  const lastBreadcrumb = breadCrumbs[breadCrumbs.length - 1]

  expect(lastBreadcrumb.name).toBe(name)
}

const successChannel = () => {
  const channel = {
    on: jest.fn(),
    push () {
      return this
    },
    receive (status: string, handler: Function) {
      status === 'ok' && handler()
      return this
    }
  }
  jest.spyOn(channel, 'push')
  jest.spyOn(channel, 'receive')
  return channel
}

let channel: ReturnType<typeof successChannel>

const sfhDetails = buildDatasetDetailPayload({ id: 55 })
const birdsDetails = buildDatasetDetailPayload({ id: 66 })
const sfh = buildDatasetPayload({ id: 55 })
const itemsV2: V2DatasetItemPayload[] = [
  buildV2DatasetItemPayload({
    id: '1'
  }),
  buildV2DatasetItemPayload({
    id: '2'
  })
]

beforeEach(() => {
  currentRouteMock = {
    path: '/datasets/1/dataset-management',
    hash: '',
    fullPath: '/datasets/1/dataset-management',
    query: {},
    params: {},
    matched: []
  }
  beforeEachMock = jest.fn().mockImplementation((guard: NavigationGuard) => {
    guard(currentRouteMock, currentRouteMock, jest.fn())
  })
  mocks = {
    $featureEnabled: (): boolean => false,
    $router: {
      beforeEach: beforeEachMock,
      currentRoute: currentRouteMock
    },
    $route: currentRouteMock
  }
})

describe('with dataset 1.0', () => {
  beforeEach(() => {
    store = createTestStore()
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
    store.commit('dataset/SET_DATASET_ITEMS', items)
    store.commit('dataset/SET_CURRENT_DATASET_LOADED')
    store.commit('dataset/SET_DATASET_ITEMS_LOADED')

    currentRouteMock.params = { path: '/root' }
    propsData = { dataset: myDataset }
  })

  it('matches the snapshot in dataset route', () => {
    currentRouteMock.params = {}
    const wrapper = shallowMount(
      DatasetManagementData,
      { localVue, mocks, propsData, store, stubs }
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot in dataset folder route', () => {
    const wrapper = shallowMount(
      DatasetManagementData,
      { localVue, mocks, propsData, store, stubs }
    )
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot when dataset is public', () => {
    store.commit('team/SET_CURRENT_TEAM', null)
    propsData = { dataset: { ...myDataset, public: true } }
    const wrapper = shallowMount(
      DatasetManagementData,
      { localVue, mocks, propsData, store, stubs }
    )

    expectLastBreadcrumbName(wrapper, 'root')
    expect(wrapper).toMatchSnapshot()
  })

  it('matches the snapshot when dataset is public', () => {
    store.commit('team/SET_CURRENT_TEAM', null)
    propsData = { dataset: { ...myDataset, public: true } }
    const wrapper = shallowMount(
      DatasetManagementData,
      { localVue, mocks, propsData, store, stubs }
    )

    expect(wrapper).toMatchSnapshot()
  })

  it('should load dataset exports', () => {
    shallowMount(DatasetManagementData, { localVue, mocks, propsData, store, stubs })
    expect(store.dispatch).toBeCalledWith('dataset/getDatasetExports', { datasetId: 1 })
  })

  it('computes breadcrumbs with special characters correctly', () => {
    currentRouteMock.params = { path: '/root' }
    currentRouteMock.hash = '#$%^&'

    store.commit('team/SET_CURRENT_TEAM', null)
    propsData = { dataset: { ...myDataset, public: true } }
    const wrapper = shallowMount(
      DatasetManagementData,
      { localVue, mocks, propsData, store, stubs }
    )

    expectLastBreadcrumbName(wrapper, 'root#$%^&')
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with dataset 2.0', () => {
  beforeEach(() => {
    mocks.$featureEnabled = (): boolean => true

    store = createTestStore()
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', sfhDetails)
    store.commit('dataset/PUSH_DATASET', sfh)
    store.commit('auth/SET_AUTHENTICATED', true)

    channel = successChannel()
    jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
    jest.spyOn(Socket, 'leave').mockResolvedValue()

    propsData = { dataset: { ...myDataset, version: 2 } }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetManagementData, {
      localVue, mocks, propsData, store, stubs
    })

    expect(wrapper).toMatchSnapshot()
  })

  it('renders v2 context menu', () => {
    const wrapper = shallowMount(DatasetManagementData, {
      localVue, mocks, propsData, store, stubs
    })

    expect(wrapper.find('v2-management-context-menu-stub').exists()).toBe(true)
  })

  it('joins channel mount', () => {
    shallowMount(DatasetManagementData, {
      localVue, mocks, propsData, store, stubs
    })
    expect(Socket.connectAndJoin).toHaveBeenCalledWith('dataset_v2:55')
  })

  it('leaves old, joins new channel on dataset change', async () => {
    const wrapper = shallowMount(DatasetManagementData, {
      localVue, mocks, propsData, store, stubs
    })
    const vm = wrapper.vm as any
    vm.datasetItems = itemsV2
    await flushPromises()

    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', birdsDetails)
    await flushPromises()

    expect(Socket.leave).toHaveBeenCalledWith('dataset_v2:55')
    expect(Socket.connectAndJoin).toHaveBeenCalledWith('dataset_v2:66')
  })

  it('binds to "items_updated"', async () => {
    const wrapper = shallowMount(DatasetManagementData, {
      localVue, mocks, propsData, store, stubs
    })
    const vm = wrapper.vm as any
    vm.datasetItems = itemsV2
    await flushPromises()
    expect(channel.on).toHaveBeenCalledWith('items_updated', expect.any(Function))
  })

  describe('on items_updated message', () => {
    let channel: EventEmitter

    beforeEach(() => {
      channel = new EventEmitter()
      jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)

      const { dispatch } = store
      const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
        if (
          action.includes('loadV2DatasetFoldersThrottled') ||
          action.includes('loadV2DatasetItemCountsThrottled')
        ) {
          return Promise.resolve({ data: {} })
        } else {
          return dispatch(action, payload, opts)
        }
      })

      store.dispatch = mockDispatch
    })

    it('dispatches to load item counts', async () => {
      const wrapper = shallowMount(DatasetManagementData, {
        localVue, mocks, propsData, store, stubs
      })
      const vm = wrapper.vm as any
      vm.datasetItems = itemsV2
      await flushPromises()
      const item = buildV2DatasetItemPayload({ id: '55', dataset_id: sfhDetails.id })
      channel.emit('items_updated', { items: [item] })

      expect(store.dispatch)
        .toHaveBeenCalledWith('dataset/loadV2DatasetItemCountsThrottled', { dataset: sfh })
    })

    it('dispatches to load folders', async () => {
      store.commit('dataset/SET_FOLDER_ENABLED', true)
      const wrapper = shallowMount(DatasetManagementData, {
        localVue, mocks, propsData, store, stubs
      })
      const vm = wrapper.vm as any
      vm.datasetItems = itemsV2
      await flushPromises()
      const item = buildV2DatasetItemPayload({ id: '55', dataset_id: sfhDetails.id })
      channel.emit('items_updated', { items: [item] })

      expect(store.dispatch)
        .toHaveBeenCalledWith('dataset/loadV2DatasetFoldersThrottled',
          { datasetId: sfhDetails.id, teamSlug: myDataset.team_slug }
        )
    })

    it('does not dispatch to load folders if folders disabled', async () => {
      store.commit('dataset/SET_FOLDER_ENABLED', false)

      const wrapper = shallowMount(DatasetManagementData, {
        localVue, mocks, propsData, store, stubs
      })
      const vm = wrapper.vm as any
      vm.datasetItems = itemsV2
      await flushPromises()
      const item = buildV2DatasetItemPayload({ id: '55', dataset_id: sfhDetails.id })
      channel.emit('items_updated', { items: [item] })

      expect(store.dispatch).not.toHaveBeenCalledWith(
        'dataset/loadV2DatasetFoldersThrottled',
        { datasetId: sfhDetails.id, teamSlug: myDataset.team_slug }
      )
    })
  })
})
