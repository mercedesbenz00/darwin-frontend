import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { loadWorkflow } from './loadWorkflow'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const workflow = buildV2WorkflowPayload({ id: '1' })

jest.mock('@/utils/backend', () => ({ loadV2Workflow: jest.fn() }))

beforeEach(() => {
  jest
    .spyOn(backend, 'loadV2Workflow')
    .mockResolvedValue({ data: workflow })
})

afterEach(() => {
  (backend.loadV2Workflow as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof loadWorkflow> = { teamSlug: 'v7', workflowId: '1' }
const ACTION = 'v2Workflow/loadWorkflow'

it('sends request', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(backend.loadV2Workflow).toHaveBeenCalledWith(PAYLOAD)
})

it('returns workflow', async () => {
  const { data } = await store.dispatch(ACTION, PAYLOAD)
  expect(data).toEqual(workflow)
})

it('pushes workflow to state', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.v2Workflow.workflows).toEqual([workflow])
})

it('responds with parsed error on failure', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'loadV2Workflow').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})
