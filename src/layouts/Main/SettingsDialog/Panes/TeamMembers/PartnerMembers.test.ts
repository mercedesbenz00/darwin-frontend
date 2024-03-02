import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildMembershipPayload,
  buildTeamPayload
} from 'test/unit/factories'

import PartnerMembers from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/PartnerMembers.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get members (): Wrapper<Vue>[] {
    return this.wrapper.findAll('read-only-member-stub').wrappers
  }
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  const partner = buildTeamPayload({ id: 5, name: 'Foo' })
  const client = buildTeamPayload({
    id: 1,
    partner_id: partner.id,
    partner,
    managed_status: 'client'
  })

  store.commit('team/SET_CURRENT_TEAM', client)

  store.commit('team/SET_MEMBERSHIPS', [
    buildMembershipPayload({ id: 1, team_id: client.id, user_id: 11 }),
    buildMembershipPayload({ id: 2, team_id: client.id, user_id: 12 }),
    buildMembershipPayload({ id: 3, team_id: partner.id, user_id: 13 }),
    buildMembershipPayload({ id: 4, team_id: partner.id, user_id: 14 }),
    buildMembershipPayload({ id: 5, team_id: partner.id, user_id: 15 })
  ])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PartnerMembers, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders partner members as read-only', () => {
  const wrapper = shallowMount(PartnerMembers, { localVue, store })
  const model = new Model(wrapper)
  expect(model.members.length).toEqual(3)
})
