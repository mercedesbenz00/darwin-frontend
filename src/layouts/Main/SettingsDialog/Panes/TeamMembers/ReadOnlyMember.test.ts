import { shallowMount, createLocalVue } from '@vue/test-utils'

import { buildMembershipPayload } from 'test/unit/factories'

import ReadOnlyMember from '@/layouts/Main/SettingsDialog/Panes/TeamMembers/ReadOnlyMember.vue'
import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: {
  member: MembershipPayload
}

beforeEach(() => {
  propsData = {
    member: buildMembershipPayload({ role: 'annotator' })
  }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ReadOnlyMember, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('owner', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'owner' })
  })

  itMatchesSnapshot()
})

describe('admin', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'admin' })
  })

  itMatchesSnapshot()
})

describe('member', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'member' })
  })

  itMatchesSnapshot()
})

describe('workforce_manager', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'workforce_manager' })
  })

  itMatchesSnapshot()
})

describe('annotator', () => {
  beforeEach(() => {
    propsData.member = buildMembershipPayload({ role: 'annotator' })
  })
  itMatchesSnapshot()
})
