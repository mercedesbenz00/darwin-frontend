import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { loadV2Workflows } from './loadV2Workflows'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const dataset = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
const workflow = buildV2WorkflowPayload()

jest.mock('@/utils/backend', () => ({ loadV2Workflows: jest.fn() }))

beforeEach(() => {
  jest
    .spyOn(backend, 'loadV2Workflows')
    .mockResolvedValue({ data: [workflow] })

  store.commit('workview/SET_DATASET', dataset)
})

afterEach(() => {
  (backend.loadV2Workflows as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof loadV2Workflows> = undefined
const ACTION = 'workview/loadV2Workflows'

it('sends request ', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.loadV2Workflows>[0] = {
    teamSlug: dataset.team_slug
  }
  expect(backend.loadV2Workflows).toHaveBeenCalledWith(expected)
})

it('returns void', async () => {
  const { data } = await store.dispatch(ACTION, PAYLOAD)
  expect(data).toEqual(undefined)
})

it('pushes workflow items to state', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.v2Workflows).toEqual([workflow])
})

it('responds with parsed error on failure', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'loadV2Workflows').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})
