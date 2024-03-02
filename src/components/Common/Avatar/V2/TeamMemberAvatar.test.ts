import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import { MembershipPayload } from '@/store/types'

import ResponsiveAvatar from './ResponsiveAvatar.vue'
import ResponsiveTeamMemberAvatar from './TeamMemberAvatar.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)
localVue.use(Vuex)

let propsData: {
  member: MembershipPayload
}

let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 7 })
const clientOfV7 = buildTeamPayload({
  id: 8,
  managed_status: 'client',
  partner_id: v7.id,
  partner: v7
})

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  propsData = {
    member: buildMembershipPayload({ id: 1, team_id: 7, first_name: 'John', last_name: 'Doe' })
  }
})

/**
 * We render a custom slot on the avatar component, so we need to unstub it.
 * Allows for better snapshots and safer testing
 */
const stubs = { ResponsiveAvatar }

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ResponsiveTeamMemberAvatar, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when member belongs to team', () => {
  itMatchesSnapshot()
})

describe('when member belongs to partner team', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', clientOfV7)
  })

  itMatchesSnapshot()

  it('renders badge', () => {
    const wrapper = shallowMount(ResponsiveTeamMemberAvatar, { localVue, propsData, store, stubs })
    expect(wrapper.find('.avatar__badge').exists()).toBe(true)
  })
})
