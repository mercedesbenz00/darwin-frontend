import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildRunningSessionPayload, buildTeamPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { runInference } from '@/store/modules/neuralModel/actions/runInference'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ runInference: jest.fn() }))

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>
let params: StoreActionPayload<typeof runInference>
const runningSession = buildRunningSessionPayload({ id: 'foo', team_id: 5 })

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)

  jest.spyOn(wind, 'runInference').mockResolvedValue(
    buildAxiosResponse({ data: ['foo'] })
  )
  params = { runningSession, image: { base64: 'fake64' } }
})

afterEach(() => {
  (wind.runInference as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/runInference')).rejects.toThrow()
})

it('calls correct wind endpoint', async () => {
  await store.dispatch('neuralModel/runInference', params)
  const expected: Parameters<typeof wind.runInference>[0] = {
    image: { base64: 'fake64' },
    runningSessionId: 'foo',
    teamId: 7
  }
  expect(wind.runInference).toHaveBeenCalledWith(expected)
})

it('returns wind response', async () => {
  const response = await store.dispatch('neuralModel/runInference', params)
  expect(response.data).toEqual(['foo'])
})

it('returns parsed error on failure', async () => {
  jest.spyOn(wind, 'runInference').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('neuralModel/runInference', params)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
