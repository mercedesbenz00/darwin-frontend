import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildInvitationPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildWorkforceManagerPayload
} from 'test/unit/factories'

import WorkforceManagers from '@/components/DatasetSettings/WorkforceManagers.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  dataset: DatasetPayload
}

let dataset: DatasetPayload

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1, default_workflow_template_id: 1, team_id: v7.id })
  store = createTestStore()
  propsData = {
    dataset
  }
})

it('requests data on mount', () => {
  shallowMount(WorkforceManagers, { localVue, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/loadWorkforceManagers', propsData.dataset)
  expect(store.dispatch).toHaveBeenCalledWith('team/getInvitations')
})

it('sets tags on subcomponent', async () => {
  const managers = [
    buildWorkforceManagerPayload({
      dataset_id: dataset.id,
      id: 1,
      invitation: null,
      user: { id: 11, first_name: 'James', last_name: 'Smith', image: null }
    }),
    buildWorkforceManagerPayload({
      dataset_id: dataset.id,
      id: 2,
      invitation: { id: 22, email: 'joe@invited.com' },
      user: null
    })
  ]

  store.commit('dataset/PUSH_WORKFORCE_MANAGERS', managers)
  const wrapper = shallowMount(WorkforceManagers, { localVue, propsData, store })

  await flushPromises()

  expect(wrapper.find('vue-tags-input-stub').props('tags')).toEqual([
    { id: '1', managerId: 1, text: 'James Smith', userId: 11, userInfo: managers[0].user },
    { id: '2', managerId: 2, text: 'joe@invited.com', invitationId: 22 }
  ])
})

it('ingores managers from other datasets', async () => {
  const wrapper = shallowMount(WorkforceManagers, { localVue, propsData, store })
  expect(wrapper.find('vue-tags-input-stub').props('tags')).toEqual([])

  const managers = [
    buildWorkforceManagerPayload({
      dataset_id: -99,
      id: 1,
      invitation: null,
      user: { id: 11, first_name: 'James', last_name: 'Smith', image: null }
    })
  ]

  store.commit('dataset/PUSH_WORKFORCE_MANAGERS', managers)

  await wrapper.vm.$nextTick()
  expect(wrapper.find('vue-tags-input-stub').props('tags')).toEqual([])
})

it('sets autocomplete from current team memberships and invites of correct role', async () => {
  const wrapper = shallowMount(WorkforceManagers, { localVue, propsData, store })
  expect(wrapper.find('vue-tags-input-stub').props('autocompleteItems')).toEqual([])

  const members = [
    buildMembershipPayload({
      id: 1,
      user_id: 111,
      team_id: v7.id,
      first_name: 'foo',
      role: 'workforce_manager'
    }),
    buildMembershipPayload({
      id: 2,
      user_id: 222,
      team_id: v7.id,
      first_name: 'bar',
      role: 'member'
    }),
    buildMembershipPayload({ id: 3, user_id: 333, team_id: -100, first_name: 'baz' })
  ]
  store.commit('team/SET_MEMBERSHIPS', members)

  store.commit('team/SET_INVITATIONS', [
    buildInvitationPayload({ id: 1, email: 'foo@i.com', team_id: v7.id, role: 'workforce_manager' }),
    buildInvitationPayload({ id: 2, email: 'bar@i.com', team_id: v7.id, role: 'member' }),
    buildInvitationPayload({ id: 3, email: 'baz@i.com', team_id: -200 })
  ])

  await wrapper.vm.$nextTick()
  expect(wrapper.find('vue-tags-input-stub').props('autocompleteItems')).toEqual([
    { id: 'membership-1', text: 'foo', userId: 111, userInfo: members[0] },
    { id: 'invitation-1', text: 'foo@i.com', invitationId: 1 }
  ])
})

it('emits change on tags change', async () => {
  const wrapper = shallowMount(WorkforceManagers, { localVue, propsData, store })
  const payload = [
    { id: 'membership-1', text: 'foo', userId: 111 },
    { id: 'invitation-1', text: 'foo@i.com', invitationId: 1 },
    { id: '3', text: 'existing', userId: 222, managerId: 3 }
  ]
  await wrapper.find('vue-tags-input-stub').vm.$emit('tags-changed', [])
  expect(wrapper.emitted().change![0]).toEqual([[]])

  await wrapper.find('vue-tags-input-stub').vm.$emit('tags-changed', payload)
  expect(wrapper.emitted().change![1]).toEqual([[
    { userId: 111 },
    { invitationId: 1 },
    { managerId: 3, userId: 222 }
  ]])
})
