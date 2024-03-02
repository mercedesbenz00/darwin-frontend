import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildLoadedVideo } from 'test/unit/factories'

import { ItemManager } from '.'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let itemManager: ItemManager

beforeEach(() => {
  store = createTestStore()
  itemManager = new ItemManager(store)
})

it('should listen for store commits', () => {
  const subscribe = jest.spyOn(store, 'subscribe')

  // eslint-disable-next-line no-new
  new ItemManager(store)

  expect(subscribe).toHaveBeenCalled()
})

it('should unsubscribe store listener', () => {
  const unsubscribe = jest.fn()
  jest.spyOn(store, 'subscribe').mockImplementation(() => unsubscribe)

  const manager = new ItemManager(store)

  manager.cleanup()

  expect(unsubscribe).toHaveBeenCalled()
})

describe('commit listener', () => {
  describe('on workview/SET_SELECTED_DATASET_ITEM', () => {
    it('should set current item', () => {
      const datasetItem = buildDatasetItemPayload({ id: 1 })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
      expect(itemManager.currentItem).toBe(datasetItem)
    })

    it('should call callbacks', () => {
      const callback = jest.fn()
      itemManager.onItemChange(callback)
      const datasetItem = buildDatasetItemPayload({ id: 1 })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)
      expect(callback).toBeCalledWith(datasetItem)
    })
  })

  describe('on workview/PUSH_VIDEO_FRAMES', () => {
    it('should call callbacks', async () => {
      jest.spyOn(itemManager, 'loadItem').mockResolvedValue({ data: buildLoadedVideo() })
      const { onVideoChange } = await itemManager.loadVideoItem(null)

      const callback = jest.fn()
      onVideoChange!(callback)

      store.commit('workview/PUSH_VIDEO_FRAMES', { loadedFrames: [] })

      expect(callback).toHaveBeenCalled()
    })
  })
})

describe('loadItem', () => {
  it('should trigger item loading action', () => {
    const datasetItem = buildDatasetItemPayload({ id: 1 })

    itemManager.loadItem(datasetItem)

    expect(store.dispatch).toHaveBeenCalledWith('workview/loadItem', datasetItem)
  })

  it('should return deep clone of the response', async () => {
    const datasetItem = buildDatasetItemPayload({ id: 1, dataset_image: null, dataset_video_id: 1 })
    const response = buildLoadedVideo({ id: 1 })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: response })

    itemManager.currentItem = datasetItem
    const { data } = await itemManager.loadItem(datasetItem)

    expect(data).toEqual(response)
    expect(data).not.toBe(response)
  })
})

describe('loadVideoItem', () => {
  it('should trigger item loading action', () => {
    const datasetItem = buildDatasetItemPayload({ id: 1 })

    itemManager.loadVideoItem(datasetItem)

    expect(store.dispatch).toHaveBeenCalledWith('workview/loadItem', datasetItem)
  })
})
