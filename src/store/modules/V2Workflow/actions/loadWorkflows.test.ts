import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildTeamPayload,
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { loadWorkflows } from './loadWorkflows'

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

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 9, slug: 'v7' }))
})

afterEach(() => {
  (backend.loadV2Workflows as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof loadWorkflows> = { worker: false }
const ACTION = 'v2Workflow/loadWorkflows'

it('throws if no current team', () => {
  store.commit('team/RESET_ALL')
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.loadV2Workflows>[0] = {
    teamSlug: dataset.team_slug,
    worker: false
  }
  expect(backend.loadV2Workflows).toHaveBeenCalledWith(expected)
})

it('returns void', async () => {
  const { data } = await store.dispatch(ACTION, PAYLOAD)
  expect(data).toEqual(undefined)
})

it('pushes workflows to state', async () => {
  const currentWorkflows = store.state.v2Workflow.workflows
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.v2Workflow.workflows).toEqual([...currentWorkflows, workflow])
})

it('responds with parsed error on failure', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'loadV2Workflows').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})
