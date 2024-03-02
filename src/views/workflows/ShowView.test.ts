import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2DARCWorkflow } from 'test/unit/factories'

import { useItemCountsStore } from '@/composables/useItemCountsStore'
import { V2DatasetStagePayload } from '@/store/types'
import { Channel, Socket } from '@/utils/socket'

import ShowView from './ShowView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)
localVue.use(Router)

let pinia: ReturnType<typeof createTestingPinia>
let store: ReturnType<typeof createTestStore>
let router: Router

beforeEach(() => {
  pinia = createTestingPinia()

  store = createTestStore()
  store.commit('auth/SET_AUTHENTICATED', true)
  store.commit('team/SET_CURRENT_TEAM', { id: 7, slug: 'v7' })

  const workflow = buildV2DARCWorkflow();
  (workflow.stages[0] as V2DatasetStagePayload).config.dataset_id = 5
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)

  router = new Router()
  router.replace({
    name: 'WorkflowCreation',
    params: { workflowId: workflow.id }
  })

  const fakeChannel = { on: jest.fn() } as unknown as Channel
  jest.spyOn(Socket, 'connectAndJoin').mockResolvedValue({ channel: fakeChannel })
})

it('loads stage counts', async () => {
  const countsStore = useItemCountsStore()
  jest.spyOn(countsStore, 'loadStageCounts').mockResolvedValue(undefined)
  const wrapper = shallowMount(ShowView, { localVue, pinia, router, store })
  await wrapper.vm.$nextTick()
  expect(countsStore.loadStageCounts).toHaveBeenCalledWith({
    dataset_ids: [5],
    not_statuses: ['archived']
  })
})

it('does not load stage counts if no dataset in workflow', async () => {
  const workflow = buildV2DARCWorkflow();
  (workflow.stages[0] as V2DatasetStagePayload).config.dataset_id = null
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)

  const countsStore = useItemCountsStore()
  jest.spyOn(countsStore, 'loadStageCounts').mockResolvedValue(undefined)

  const wrapper = shallowMount(ShowView, { localVue, pinia, router, store })
  await wrapper.vm.$nextTick()

  expect(countsStore.loadStageCounts).not.toHaveBeenCalled()
})

it('joins dataset channel', async () => {
  const wrapper = shallowMount(ShowView, { localVue, pinia, router, store })
  await wrapper.vm.$nextTick()
  expect(Socket.connectAndJoin).toHaveBeenCalledWith('dataset_v2:5')
})
