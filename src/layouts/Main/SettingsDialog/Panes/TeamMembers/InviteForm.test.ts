import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import InviteForm from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/InviteForm.vue'
import { Ability, MembershipRole } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const ability: Ability = { actions: ['manage_invitations'], subject: 'all' }

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_ABILITIES', [ability])
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get emailField (): Wrapper<Vue> {
    return this.wrapper.find('input-field-stub')
  }

  get email (): { wrapper: Wrapper<Vue>, disabled: boolean } {
    const wrapper = this.emailField
    return {
      wrapper,
      disabled: wrapper.props('disabled')
    }
  }

  setEmail (email: string): void {
    this.emailField.vm.$emit('input', email)
  }

  get roleField (): Wrapper<Vue> {
    return this.wrapper.find('role-dropdown-stub')
  }

  get role (): { wrapper: Wrapper<Vue>, disabled: boolean, value: string } {
    const wrapper = this.roleField
    return {
      wrapper,
      disabled: wrapper.props('disabled'),
      value: wrapper.props('value')
    }
  }

  setRole (role: MembershipRole): void {
    this.roleField.vm.$emit('input', role)
  }

  get button (): { wrapper: Wrapper<Vue>, disabled: boolean } {
    const wrapper = this.wrapper.find('button')
    return {
      wrapper,
      disabled: wrapper.attributes('disabled') === 'disabled'
    }
  }

  clickButton (): Promise<void> | void {
    return this.button.wrapper.trigger('click')
  }
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(InviteForm, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when client team', () => {
  const partner = buildTeamPayload({ id: 1, managed_status: 'partner' })
  const client = buildTeamPayload({
    id: 2, managed_status: 'client', partner, partner_id: partner.id
  })

  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', client)
  })

  describe('viewed as partner team member', () => {
    beforeEach(() => {
      const user = buildUserPayload({ id: 9 })
      store.commit('user/SET_PROFILE', user)
      store.commit('team/SET_MEMBERSHIPS', [
        buildMembershipPayload({ id: 1, user_id: user.id, team_id: partner.id })
      ])
    })

    itMatchesSnapshot()

    it('renders as disabled', () => {
      const wrapper = shallowMount(InviteForm, { localVue, store })
      const model = new Model(wrapper)
      expect(model.email.disabled).toBe(true)
      expect(model.role.disabled).toBe(true)
      expect(model.button.disabled).toBe(true)
    })
  })
})

describe('when regular team', () => {
  const team = buildTeamPayload({ id: 90, managed_status: 'regular' })
  const user = buildUserPayload({ id: 9 })
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', team)
  })

  describe('as full member', () => {
    beforeEach(() => {
      store.commit('user/SET_PROFILE', user)
      store.commit('team/SET_MEMBERSHIPS', [
        buildMembershipPayload({ id: 1, user_id: user.id, team_id: team.id })
      ])
    })

    itMatchesSnapshot()

    it('creates new invitation', async () => {
      const wrapper = shallowMount(InviteForm, { localVue, store })

      const email = 'another_invitation@example.com'
      const role = 'member'

      const model = new Model(wrapper)

      await model.setEmail(email)
      await model.setRole(role)
      await model.clickButton()

      expect(store.dispatch).toHaveBeenCalledWith('team/addInvitations', {
        teamId: team.id,
        invitations: [{ email, role }]
      })
    })
  })

  describe('as workforce manager', () => {
    const ability: Ability = {
      actions: ['manage_invitations'], subject: 'invitation', conditions: { role: 'annotator' }
    }
    beforeEach(() => {
      const membership = buildMembershipPayload({
        id: 1,
        user_id: user.id,
        team_id: team.id,
        role: 'workforce_manager'
      })

      store.commit('team/SET_MEMBERSHIPS', [membership])
      store.commit('auth/SET_ABILITIES', [ability])
    })

    itMatchesSnapshot()

    test('preselects worker role', async () => {
      const wrapper = shallowMount(InviteForm, { localVue, store })
      await wrapper.vm.$nextTick()

      const model = new Model(wrapper)

      expect(model.role.value).toEqual('annotator')
    })
  })
})
