import { createLocalVue } from '@vue/test-utils'
import { AxiosResponse } from 'axios'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetVideoPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { api } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'workview/loadItemVideoData'

const datasetItem = buildDatasetItemPayload({
  id: 90,
  dataset_video_id: 1,
  dataset_video: buildDatasetVideoPayload({ id: 1 })
})
const responseValue = {}

mockApi()

beforeEach(() => {
  jest.spyOn(api, 'get').mockResolvedValue({ data: responseValue } as AxiosResponse)

  store = createUnstubbedTestStore()
})

it('should avoid same requests', () => {
  store.dispatch(ACTION, datasetItem)
  store.dispatch(ACTION, datasetItem)

  expect(api.get).toHaveBeenCalledTimes(1)
})

it('same request should return cached API request', async () => {
  const promise1 = store.dispatch(ACTION, datasetItem)
  const promise2 = store.dispatch(ACTION, datasetItem)

  expect(await promise1).toEqual(await promise2)
})

it('should allow multiple requests with different payload', async () => {
  const newDatasetItem = buildDatasetItemPayload({
    id: 2,
    dataset_video_id: 2,
    dataset_video: buildDatasetVideoPayload({ id: 2 })
  })

  const promise1 = store.dispatch(ACTION, datasetItem)
  const promise2 = store.dispatch(ACTION, newDatasetItem)

  expect(await promise1).not.toEqual(await promise2)
  expect(api.get).toHaveBeenCalledTimes(2)
})
