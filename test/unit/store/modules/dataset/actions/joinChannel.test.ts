import { EventEmitter } from 'events'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetItemPayload, buildDatasetPayload } from 'test/unit/factories'

import { joinChannel } from '@/store/modules/dataset/actions/joinChannel'
import { DatasetItemStatus, StoreActionPayload } from '@/store/types'
import { Socket } from '@/utils'

jest.mock('@/utils/backend', () => ({
  loadDatasetFolders: jest.fn().mockImplementation(() => ({ data: [] })),
  loadDatasetItemCounts: jest.fn().mockImplementation(() => ({ data: [] }))
}))

const localVue = createLocalVue()
localVue.use(Vuex)

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

const sfhDetails = buildDatasetDetailPayload({ id: 7 })
const sfh = buildDatasetPayload({ id: 7 })

let store: ReturnType<typeof createUnstubbedTestStore>
let channel: ReturnType<typeof successChannel>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', sfhDetails)
  store.commit('dataset/PUSH_DATASET', sfh)

  channel = successChannel()
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
})

const ACTION = 'dataset/joinChannel'
const payload: StoreActionPayload<typeof joinChannel> = { topic: 'dataset:1' }

it('works correctly', async () => {
  await store.dispatch(ACTION, payload)
  expect(Socket.connectAndJoin).toHaveBeenCalledWith('dataset:1')
})

it('binds to "items_updated"', async () => {
  await store.dispatch(ACTION, payload)
  expect(channel.on).toHaveBeenCalledWith('items_updated', expect.any(Function))
})

it('returns error on Socket.connectAndJoin error', async () => {
  jest.spyOn(Socket, 'connectAndJoin').mockRejectedValue({ })

  const response = await store.dispatch(ACTION, payload)

  expect(response).toEqual({
    error: expect.objectContaining({
      code: 'SOCKET_ERROR',
      message: 'Dataset channel not available'
    })
  })
})

describe('on items_updated message', () => {
  let channel: EventEmitter

  beforeEach(() => {
    channel = new EventEmitter()
    jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)

    const { dispatch } = store

    const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
      if (
        action.includes('loadDatasetFoldersThrottled') ||
        action.includes('loadDatasetItemCountsThrottled')
      ) {
        return Promise.resolve({ data: {} })
      } else {
        return dispatch(action, payload, opts)
      }
    })

    store.dispatch = mockDispatch
  })

  it('pushes item on items_updated event', async () => {
    const item = buildDatasetItemPayload({
      id: 55,
      dataset_id: sfhDetails.id,
      status: DatasetItemStatus.annotate
    })
    store.commit('workview/PUSH_DATASET_ITEM', item)
    await store.dispatch(ACTION, payload)

    const updatedItem = { ...item, status: DatasetItemStatus.review }
    channel.emit('items_updated', { dataset_items: [updatedItem] })
    expect(store.state.dataset.datasetItems).toEqual([updatedItem])
  })

  it('does not push item from different dataset', async () => {
    await store.dispatch(ACTION, payload)

    const item = buildDatasetItemPayload({ id: 55, dataset_id: -1 })
    channel.emit('items_updated', { dataset_items: [item] })
    expect(store.state.dataset.datasetItems).toEqual([])
  })

  it('does not push item if dataset unset', () => {
    store.commit('dataset/RESET_CURRENT_DATASET', null)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfhDetails.id })
    channel.emit('items_updated', { dataset_items: [item] })
    expect(store.state.dataset.datasetItems).toEqual([])
  })

  it('dispatches to load item counts', async () => {
    await store.dispatch(ACTION, payload)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfhDetails.id })
    channel.emit('items_updated', { dataset_items: [item] })

    expect(store.dispatch)
      .toHaveBeenCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: sfh })
  })

  it('dispatches to load folders', async () => {
    store.commit('dataset/SET_FOLDER_ENABLED', true)
    await store.dispatch(ACTION, payload)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfhDetails.id })
    channel.emit('items_updated', { dataset_items: [item] })

    expect(store.dispatch)
      .toHaveBeenCalledWith('dataset/loadDatasetFoldersThrottled', { datasetId: sfhDetails.id })
  })

  it('does not dispatch to load folders if folders disabled', async () => {
    store.commit('dataset/SET_FOLDER_ENABLED', false)

    await store.dispatch(ACTION, payload)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfhDetails.id })
    channel.emit('items_updated', { dataset_items: [item] })

    expect(store.dispatch)
      .not.toHaveBeenCalledWith('dataset/loadDatasetFoldersThrottled', { datasetId: sfhDetails.id })
  })
})
