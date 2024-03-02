import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetItemsCountPayload, buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import QuoteDialog from '@/components/ModelCreation/ModelSummary/QuoteDialog.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)
localVue.use(VModal)
localVue.directive('v-loading', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const stubs: Stubs = { 'router-link': true }

beforeEach(() => {
  store = createTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ superuser: false }))
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ }))

  const counts = buildDatasetItemsCountPayload({ item_count: 5001 })
  store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)
})

const propsData = {
  open: true
}

const itMatchesSnapshot = () => it('matches snapshot', async () => {
  const wrapper = shallowMount(QuoteDialog, { localVue, propsData, store, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('renders cost estimate', async () => {
  const wrapper = shallowMount(QuoteDialog, { localVue, propsData, store, stubs })

  expect(wrapper.text()).toContain('120 credits')

  const counts = buildDatasetItemsCountPayload({ item_count: 1000 })
  store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('40 credits')
})
