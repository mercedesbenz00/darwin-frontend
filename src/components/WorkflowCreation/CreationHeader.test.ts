import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload, buildV2DARCWorkflow } from 'test/unit/factories'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V2/BreadCrumbs.vue'

import CreationHeader from './CreationHeader.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)
localVue.component('BreadCrumbs', BreadCrumbs)

let store: ReturnType<typeof createTestStore>

localVue.use(Router)
localVue.component('BreadCrumbs', BreadCrumbs)

let router: Router
const stubs: Stubs = {
  BreadCrumbs: localVue.extend({
    template: '<div><div v-for="slot in Object.keys($slots)"><slot :name="slot"/></div></div>'
  })
}
let pinia: ReturnType<typeof createTestingPinia>

beforeEach(() => {
  pinia = createTestingPinia()
  router = new Router()
  store = createTestStore()
  const workflow = buildV2DARCWorkflow()
  workflow.name = 'old name'
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({}))
})

it('can update workflow name', () => {
  const wrapper = shallowMount(CreationHeader, { localVue, pinia, router, store, stubs })
  expect(store.state.v2Workflow.editedWorkflow?.name).toEqual('old name')
  wrapper.find('workflowname-stub').vm.$emit('change', 'new name')
  expect(store.state.v2Workflow.editedWorkflow?.name).toEqual('new name')
})
