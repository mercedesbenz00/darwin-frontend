import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2WorkflowPayload } from 'test/unit/factories'

import { V2WorkflowPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2WorkflowPayload()

beforeEach(() => {
  store = createTestStore()
  store.commit('v2Workflow/SET_WORKFLOW', {
    ...workflow,
    id: '1',
    name: 'Workflow-1'
  })
})

const getter = (store: ReturnType<typeof createTestStore>, id: string): V2WorkflowPayload =>
  store.getters['v2Workflow/getWorkflowById'](id)

it('should return workflow', () => {
  const result = getter(store, '1')
  expect(result).toBeTruthy()
  expect(result.id).toEqual('1')
})

it('should return null', () => {
  const result = getter(store, '2')
  expect(result).toBeFalsy()
  expect(result).toEqual(null)
})
