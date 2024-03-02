import { EventEmitter } from 'events'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetPayload } from 'test/unit/factories'

import { joinChannel } from '@/store/modules/workview/actions/joinChannel'
import { DatasetItemStatus, StoreActionPayload } from '@/store/types'
import { Socket } from '@/utils'

jest.mock('@/utils/backend', () => ({
  loadDatasetFolders: jest.fn().mockImplementation(() => ({ data: [] })),
  loadDatasetItemCounts: jest.fn().mockImplementation(() => ({ data: 'foo' }))
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

const sfh = buildDatasetPayload({ id: 7 })

let store: ReturnType<typeof createUnstubbedTestStore>
let channel: ReturnType<typeof successChannel>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('workview/SET_DATASET', sfh)

  channel = successChannel()
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel } as any)
})

const ACTION = 'workview/joinChannel'
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
      dataset_id: sfh.id,
      status: DatasetItemStatus.annotate
    })
    store.commit('workview/PUSH_DATASET_ITEM', item)
    await store.dispatch(ACTION, payload)

    const updatedItem = { ...item, status: DatasetItemStatus.review }
    channel.emit('items_updated', { dataset_items: [updatedItem] })
    expect(store.state.workview.datasetItems).toEqual([updatedItem])
  })

  it('does not push item from different dataset', async () => {
    await store.dispatch(ACTION, payload)

    const item = buildDatasetItemPayload({ id: 55, dataset_id: -1 })
    channel.emit('items_updated', { dataset_items: [item] })
    expect(store.state.workview.datasetItems).toEqual([])
  })

  it('does not push item if dataset unset', () => {
    store.commit('workview/SET_DATASET', null)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfh.id })
    channel.emit('items_updated', { dataset_items: [item] })
    expect(store.state.workview.datasetItems).toEqual([])
  })

  it('does not push item if item not already in state', async () => {
    const item = buildDatasetItemPayload({
      id: 55,
      dataset_id: sfh.id,
      status: DatasetItemStatus.annotate
    })

    await store.dispatch(ACTION, payload)

    const updatedItem = { ...item, status: DatasetItemStatus.review }
    channel.emit('items_updated', { dataset_items: [updatedItem] })
    expect(store.state.workview.datasetItems).toEqual([])
  })

  /** NOTE: Skipped due to relevant logic inside the action also being skipped */
  it.skip('dispatches to load item counts', async () => {
    await store.dispatch(ACTION, payload)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfh.id })
    channel.emit('items_updated', { dataset_items: [item] })

    expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFoldersThrottled', undefined)
  })

  /** NOTE: Skipped due to relevant logic inside the action also being skipped */
  it.skip('dispatches to load folders', async () => {
    await store.dispatch(ACTION, payload)
    const item = buildDatasetItemPayload({ id: 55, dataset_id: sfh.id })
    channel.emit('items_updated', { dataset_items: [item] })

    expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFoldersThrottled', undefined)
  })
})
