import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import Member from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/Member.vue'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  member: MembershipPayload,
}

const v7 = buildTeamPayload({ id: 7, name: 'v7' })
const joe = buildUserPayload({ id: 1, first_name: 'Joe' })

const mocks: { $can: IsAuthorized } = {
  $can: () => false
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('user/SET_PROFILE', joe)

  propsData = {
    member: buildMembershipPayload({ role: 'annotator' })
  }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Member, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersDropdown = () => {
  it('renders dropdown', () => {
    const wrapper = shallowMount(Member, { localVue, mocks, propsData, store })
    expect(wrapper.find('role-dropdown-stub').exists()).toBe(true)
  })
}

const itDoesNotRenderDropdown = () => {
  it('renders dropdown', () => {
    const wrapper = shallowMount(Member, { localVue, mocks, propsData, store })
    expect(wrapper.find('role-dropdown-stub').exists()).toBe(false)
  })
}

const whenUserIsOwner = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      (['update_membership', 'delete_membership'].includes(ability) &&
      ['annotator', 'member', 'admin', 'workforce_manager'].includes(options?.resource.role)) ||
      ability === 'transfer_team_ownership'
  })
}

const whenUserIsAdmin = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ['update_membership', 'delete_membership'].includes(ability) &&
      ['annotator', 'member', 'admin', 'workforce_manager'].includes(options?.resource.role)
  })
}

const whenUserIsMember = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ['update_membership', 'delete_membership'].includes(ability) &&
      ['annotator', 'member', 'workforce_manager'].includes(options?.resource.role)
  })
}

const whenUserIsAnnotator = () => {
  beforeEach(() => {
    mocks.$can = () => false
  })
}

const whenUserIsWorkforceManager = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ability === 'delete_membership' && options?.resource.role === 'annotator'
  })
}

describe('owner', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'owner' })
  })

  describe('when user is owner', () => {
    whenUserIsOwner()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is admin', () => {
    whenUserIsAdmin()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is member', () => {
    whenUserIsMember()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is annotator', () => {
    whenUserIsAnnotator()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is workforce manager', () => {
    whenUserIsWorkforceManager()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })
})

describe('admin', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'admin' })
  })

  describe('when user is owner', () => {
    whenUserIsOwner()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is admin', () => {
    whenUserIsAdmin()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is member', () => {
    whenUserIsMember()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is annotator', () => {
    whenUserIsAnnotator()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is workforce manager', () => {
    whenUserIsWorkforceManager()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })
})

describe('member', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'member' })
  })

  describe('when user is owner', () => {
    whenUserIsOwner()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is admin', () => {
    whenUserIsAdmin()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is member', () => {
    whenUserIsMember()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is annotator', () => {
    whenUserIsAnnotator()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is workforce manager', () => {
    whenUserIsWorkforceManager()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })
})

describe('workforce_manager', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'workforce_manager' })
  })

  describe('when user is owner', () => {
    whenUserIsOwner()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is admin', () => {
    whenUserIsAdmin()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is member', () => {
    whenUserIsMember()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is annotator', () => {
    whenUserIsAnnotator()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is workforce manager', () => {
    whenUserIsWorkforceManager()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })
})

describe('annotator', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'annotator' })
  })

  describe('when user is owner', () => {
    whenUserIsOwner()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is admin', () => {
    whenUserIsAdmin()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is member', () => {
    whenUserIsMember()
    itMatchesSnapshot()
    itRendersDropdown()
  })

  describe('when user is annotator', () => {
    whenUserIsAnnotator()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })

  describe('when user is workforce manager', () => {
    whenUserIsWorkforceManager()
    itMatchesSnapshot()
    itDoesNotRenderDropdown()
  })
})
