import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import loadingDirective from '@/directives/loading'
import TeamMembers from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/TeamMembers.vue'
import Abilities from '@/plugins/abilities'
import { installCommonComponents } from '@/plugins/components'
import Theme from '@/plugins/theme'
import { Ability } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Theme)
localVue.use(VModal, { dynamic: true })

installCommonComponents(localVue)

localVue.directive('loading', loadingDirective)
// lazy-load directive fires network requests, so we stub it
localVue.directive('lazy', stubDirectiveWithAttribute)
let store: ReturnType<typeof createTestStore>

const mocks = {
  // part of the lazy-load plugin
  $Lazyload: {
    $off: jest.fn(),
    $on: jest.fn(),
    $once: jest.fn()
  },
  // $theme heavily relies on DOM measurements, so easier to stub
  $theme: createMockTheme()
}

beforeEach(() => {
  store = createTestStore()
  localVue.use(Abilities, store)
})

class BaseMemberModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get fullName (): string {
    return this.wrapper.find('.member__name').text()
  }
}

class ReadOnlyMemberModel extends BaseMemberModel {
  get roleLabel (): string {
    return this.wrapper.find('.member__role .member__role--fixed').text()
  }
}

class MemberModel extends BaseMemberModel {
  get selectedRole (): string {
    return this.wrapper.find('.member__role select').attributes('value') || ''
  }
}

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get members (): MemberModel[] {
    return this
      .wrapper.findAll('.members__memberships .member')
      .wrappers.map(w => new MemberModel(w))
  }

  get partnerMembers (): ReadOnlyMemberModel[] {
    return this
      .wrapper.findAll('.partner-members .member')
      .wrappers.map(w => new ReadOnlyMemberModel(w))
  }
}

describe('when client team', () => {
  beforeEach(() => {
    const abilities: Ability[] = [
      { subject: 'all', actions: ['update_membership'] }
    ]
    store.commit('auth/SET_ABILITIES', abilities)
    const partner = buildTeamPayload({ id: 5, name: 'Foo' })
    const client = buildTeamPayload({
      id: 1,
      partner_id: partner.id,
      partner,
      managed_status: 'client'
    })

    store.commit('team/SET_CURRENT_TEAM', client)

    store.commit('team/SET_MEMBERSHIPS', [
      buildMembershipPayload({
        id: 1,
        team_id: client.id,
        user_id: 10,
        first_name: 'Mike',
        role: 'member'
      }),
      buildMembershipPayload({
        id: 2,
        team_id: client.id,
        user_id: 20,
        first_name: 'Joan',
        last_name: 'Coleson',
        role: 'owner'
      }),
      buildMembershipPayload({
        id: 3,
        team_id: partner.id,
        user_id: 30,
        first_name: 'Joe',
        last_name: 'Smith',
        role: 'annotator'
      }),
      buildMembershipPayload({
        id: 4,
        team_id: partner.id,
        user_id: 40,
        first_name: 'Jack',
        role: 'admin'
      }),
      buildMembershipPayload({
        id: 5,
        team_id: partner.id,
        user_id: 50,
        last_name: 'Michaels',
        role: 'member'
      })
    ])
  })

  it('matches snapshot', () => {
    const wrapper = mount(TeamMembers, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders members', () => {
    const wrapper = mount(TeamMembers, { localVue, mocks, store })
    const model = new Model(wrapper)
    expect(model.members.length).toEqual(2)
    const [joan, mike] = model.members
    expect(mike.fullName).toEqual('Mike')
    expect(joan.fullName).toEqual('Joan Coleson')
  })

  it('renders partner members, ordered by role', () => {
    const wrapper = mount(TeamMembers, { localVue, mocks, store })
    const model = new Model(wrapper)
    expect(model.partnerMembers.length).toEqual(3)
    const [jack, michaels, joe] = model.partnerMembers
    expect(jack.fullName).toEqual('Jack')
    expect(jack.roleLabel).toEqual('Admin')
    expect(michaels.fullName).toEqual('Michaels')
    expect(michaels.roleLabel).toEqual('User')
    expect(joe.fullName).toEqual('Joe Smith')
    expect(joe.roleLabel).toEqual('Worker')
  })
})
