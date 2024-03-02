import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import clickOutsideDirective from '@/directives/click-outside'
import { DatasetItemStatus, MembershipPayload } from '@/store/types'

import AssignmentDropdown from './AssignmentDropdown.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VTooltip, { defaultHtml: true })
localVue.directive('click-outside', clickOutsideDirective)

let store: ReturnType<typeof createTestStore>

let propsData: {
  status: DatasetItemStatus
}

let members: MembershipPayload[] = []

beforeEach(() => {
  store = createTestStore()
  members = [
    buildMembershipPayload({ team_id: 7, id: 9, user_id: 99 }),
    buildMembershipPayload({ team_id: 7, id: 10, user_id: 100 }),
    buildMembershipPayload({ team_id: 7, id: 11, user_id: 101 }),
    buildMembershipPayload({ team_id: 8, id: 11, user_id: 101 })
  ]

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7, name: 'V7' }))
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 99 }))
  store.commit('team/SET_MEMBERSHIPS', members)

  propsData = {
    status: DatasetItemStatus.annotate
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(AssignmentDropdown, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('renders button for every current team member in store', async () => {
  const wrapper = shallowMount(AssignmentDropdown, { localVue, propsData, store })
  await wrapper.setData({ open: true })
  expect(wrapper.findAll('.assignment__item').length).toEqual(3)
})

it('triggers event when clicking assignee', async () => {
  const wrapper = shallowMount(AssignmentDropdown, { localVue, propsData, store })
  await wrapper.setData({ open: true })
  const firstAssignee = wrapper.findAll('.assignment__item').at(0)
  await firstAssignee.vm.$emit('click')
  expect(wrapper.emitted().assign).toEqual([[members[0]]])
})
