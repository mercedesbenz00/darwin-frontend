import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildParsedError, buildTeamPayload } from 'test/unit/factories'

import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import runInference from '@/store/modules/workview/actions/runInference'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ runInference: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

const v7 = buildTeamPayload({ id: 7 })

let store: ReturnType<typeof createUnstubbedTestStore>
let params: StoreActionPayload<typeof runInference>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)

  jest.spyOn(wind, 'runInference').mockResolvedValue(buildAxiosResponse({ data: 'foo' }))

  const topLeft = new Point<'Image'>({ x: 1, y: 1 })
  const bottomRight = new Point<'Image'>({ x: 101, y: 101 })
  params = {
    data: {
      image: { url: 'foo' },
      data: { bbox: new Rectangle<'Image'>(topLeft, bottomRight), clicks: [] }
    },
    runningSessionId: 'fake-id'
  }
})

afterEach(() => {
  (wind.runInference as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('workview/runInference')).rejects.toThrow()
})

it('calls correct wind endpoint', async () => {
  await store.dispatch('workview/runInference', params)
  const expected: Parameters<typeof wind.runInference>[0] = {
    image: { url: 'foo' },
    data: { bbox: { x: 1, y: 1, w: 100, h: 100 }, clicks: [] },
    runningSessionId: 'fake-id',
    teamId: 7
  }
  expect(wind.runInference).toHaveBeenCalledWith(expected)
})

it('returns wind response', async () => {
  const response = await store.dispatch('workview/runInference', params)
  expect(response.data).toEqual('foo')
})

it('returns parsed error on failure', async () => {
  jest.spyOn(wind, 'runInference').mockResolvedValue(buildParsedError({ message: 'foo' }))
  const { error } = await store.dispatch('workview/runInference', params)
  expect(error.message).toEqual('foo')
})
