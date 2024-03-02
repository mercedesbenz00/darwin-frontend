import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildInvitationPayload, buildTeamPayload } from 'test/unit/factories'

import Invitation from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/Invitation.vue'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { InvitationPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  invitation: InvitationPayload,
}

const v7 = buildTeamPayload({ id: 7, name: 'v7' })

const mocks: { $can: IsAuthorized } = {
  $can: () => false
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)

  propsData = {
    invitation: buildInvitationPayload({ role: 'annotator' })
  }
})

const whenUserIsAnnotator = () => {
  beforeEach(() => {
    mocks.$can = () => false
  })
}

const whenUserIsWorkforceManager = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ability === 'manage_invitations' && ['annotator'].includes(options?.resource.role)
  })
}

const whenUserIsMember = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ability === 'manage_invitations' &&
      ['annotator', 'member', 'workforce_manager'].includes(options?.resource.role)
  })
}

const whenUserIsAdmin = () => {
  beforeEach(() => {
    mocks.$can = (ability, options) =>
      ability === 'manage_invitations' &&
      ['annotator', 'member', 'workforce_manager', 'admin'].includes(options?.resource.role)
  })
}

const whenUserIsOwner = whenUserIsAdmin

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Invitation, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersDropdown = () => {
  it('renders dropdown', () => {
    const wrapper = shallowMount(Invitation, { localVue, mocks, propsData, store })
    expect(wrapper.find('role-dropdown-stub').exists()).toBe(true)
  })
}

const itDoesNotRenderDropdown = () => {
  it('does not render dropdown', () => {
    const wrapper = shallowMount(Invitation, { localVue, mocks, propsData, store })
    expect(wrapper.find('role-dropdown-stub').exists()).toBe(false)
  })
}

describe('admin invitation', () => {
  beforeEach(() => {
    propsData.invitation = buildInvitationPayload({ role: 'admin' })
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

describe('"member" invitation', () => {
  beforeEach(() => {
    propsData.invitation = buildInvitationPayload({ role: 'member' })
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

describe('"workforce_manager" invitation', () => {
  beforeEach(() => {
    propsData.invitation = buildInvitationPayload({ role: 'workforce_manager' })
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

describe('"annotator" invitation', () => {
  beforeEach(() => {
    propsData.invitation = buildInvitationPayload({ role: 'annotator' })
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
    itRendersDropdown()
  })
})
