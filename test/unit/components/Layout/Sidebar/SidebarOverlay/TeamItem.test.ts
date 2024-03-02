import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'
import { triggerRootStub } from 'test/unit/testHelpers'

import TeamItem from '@/components/Layout/Sidebar/SidebarOverlay/TeamItem.vue'
import { TeamPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 7, name: 'V7', image: { id: 1, url: 'foo', thumbnail_url: 'bar' } })
const v7Members = [
  buildMembershipPayload({ id: 71, team_id: v7.id }),
  buildMembershipPayload({ id: 72, team_id: v7.id }),
  buildMembershipPayload({ id: 73, team_id: v7.id })
]

const v8 = buildTeamPayload({ id: 8, name: 'V8', image: { id: 2, url: 'baz', thumbnail_url: 'bat' } })
const v8Members = [
  buildMembershipPayload({ id: 81, team_id: v8.id }),
  buildMembershipPayload({ id: 82, team_id: v8.id })
]
let propsData: { team: TeamPayload}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/PUSH_MEMBERSHIPS', [...v7Members, ...v8Members])
  propsData = { team: v7 }
})

it('emits click', () => {
  const wrapper = shallowMount(TeamItem, { localVue, propsData, store })
  triggerRootStub(wrapper, 'click')
  expect(wrapper.emitted().click!.length).toEqual(1)
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(TeamItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

const whenPartner = () => describe('when partner', () => {
  beforeEach(() => {
    propsData.team = { ...propsData.team, managed_status: 'partner' }
  })

  itMatchesSnapshot()

  it('renders partner pill', () => {
    const wrapper = shallowMount(TeamItem, { localVue, propsData, store })
    expect(wrapper.find('partner-pill-stub').exists()).toBe(true)
  })
})

describe('when current team', () => {
  itMatchesSnapshot()

  it('renders member count', () => {
    const wrapper = shallowMount(TeamItem, { localVue, propsData, store })
    expect(wrapper.text()).toContain('3 team members')
  })

  whenPartner()
})

describe('when not current team', () => {
  beforeEach(() => {
    propsData.team = v8
  })

  itMatchesSnapshot()

  it('does not render member count', () => {
    const wrapper = shallowMount(TeamItem, { localVue, propsData, store })
    expect(wrapper.text()).not.toContain('team members')
  })

  whenPartner()
})
