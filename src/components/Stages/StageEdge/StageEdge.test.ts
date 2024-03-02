import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildEdgePayload,
  buildTeamPayload,
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import StageEdge from '@/components/Stages/StageEdge/StageEdge.vue'
import { StageType } from '@/store/types/StageType'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)

let store: ReturnType<typeof createTestStore>
let pinia: ReturnType<typeof createTestingPinia>

const stageUUID = '2'

const workflow = buildV2WorkflowPayload({
  stages: [
    buildV2WorkflowStagePayload({
      type: StageType.Annotate,
      edges: [buildEdgePayload({})]
    })
  ]
})

const propsDataIn = {
  scale: 1,
  stageId: stageUUID,
  name: 'approve',
  edge: workflow.stages[0].edges[0],
  edgeType: 'in',
  type: 'review'
}

const v7 = buildTeamPayload({ id: 7 })

jest.mock('@/components/WorkflowCreation/Grid/useGridStore', () => ({
  useGridStore: () => ({
    setEdgePosition: jest.fn()
  })
}))

beforeEach(() => {
  pinia = createTestingPinia()
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit(
    'team/SET_MEMBERSHIPS',
    Object.values([
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        user_id: 11,
        team_id: v7.id,
        role: 'annotator',
        email: 'test@example.com',
        image: null
      }
    ])
  )
  store.commit('v2Workflow/SET_WORKFLOW', workflow)
})

it('should convert id into edgeConnectorId', () => {
  const wrapper = shallowMount(StageEdge, {
    localVue,
    pinia,
    store,
    propsData: propsDataIn
  })
  expect(wrapper.element.id).toBe(`${stageUUID}_approve_in`)
})

it('should apply theme colors', () => {
  const wrapper = shallowMount(StageEdge, {
    localVue,
    pinia,
    store,
    propsData: propsDataIn
  })
  expect(wrapper.attributes('style'))
    .toContain('--edgeColor: rgba(245, 184, 0, 1); --edgeColorFocus: rgba(245, 184, 0, 1);')
})

it('emits dragAction when edge is clicked', async () => {
  const wrapper = shallowMount(StageEdge, {
    localVue,
    pinia,
    store,
    propsData: propsDataIn
  })
  await wrapper.vm.$emit('mousedown')

  expect(wrapper.emitted().mousedown).toBeTruthy()
})
