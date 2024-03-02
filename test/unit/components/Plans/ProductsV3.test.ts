import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import ProductsV3 from '@/components/Plans/ProductsV3.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1, managed_status: 'regular' }))
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ProductsV3, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('passes error event out', () => {
  const wrapper = shallowMount(ProductsV3, { localVue, store })
  wrapper.find('annotation-credits-stub').vm.$emit('billing-error', 'foo')
  expect(wrapper.emitted()['billing-error']![0]).toEqual(['foo'])
})

describe('when client team', () => {
  beforeEach(() => {
    const partner = buildTeamPayload({ name: 'Some partner' })
    const client = buildTeamPayload({ id: 1, managed_status: 'client', partner })
    store.commit('team/SET_CURRENT_TEAM', client)
  })

  itMatchesSnapshot()
})
