import { createLocalVue, shallowMount } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildUserPayload, buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import team from '@/store/modules/team'
import user from '@/store/modules/user'

import CommentItem from './CommentItem.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})
localVue.use(Vuex)
installCommonComponents(localVue)

const PopoverStub = localVue.component('VPopover', {
  template: '<div><slot name="popover"></slot></div>'
})

const joe = buildUserPayload({ id: 1, first_name: 'Joe', last_name: 'Someone' })
const joeMembership = buildMembershipPayload({
  id: 1, first_name: 'Joe', last_name: 'Someone', user_id: 1, team_id: 1
})

const sam = buildUserPayload({ id: 2, first_name: 'Sam', last_name: 'Someone' })
const samMembership = buildMembershipPayload({
  id: 2, first_name: 'Sam', last_name: 'Someone', user_id: 2, team_id: 1
})

const comment = {
  id: 1,
  authorId: 1,
  body: 'comment',
  commentThreadId: 1,
  // old date, so we can have consistent formatting.
  // Just `new Date() has different formatting based on local timezone`
  insertedAt: Date.now(),
  updatedAt: Date.now()
}

const v7 = buildTeamPayload({ id: 1, name: 'V7' })

const newStore = () => {
  const store = new Vuex.Store({
    modules: {

      team: { ...team, state: cloneDeep(team.state) },
      user: { ...user, state: cloneDeep(user.state) }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  return store
}

const stubs = {
  'v-popover': PopoverStub
}

const propsData = {
  showResolve: true,
  showDeleteCommentThread: true,
  comment,
  team: v7,
}
const mocks = { $can: () => true }

beforeEach(() => { jest.useFakeTimers() })

it('renders comment authored by current user', () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  expect(wrapper).toMatchSnapshot()
})

it('renders comment authored by other user', () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', sam)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])
  const mocks = { $can: () => true }
  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  expect(wrapper).toMatchSnapshot()
})

it('renders comment authored when viewing as someone else entirely', () => {
  const store = newStore()
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])
  const mocks = { $can: () => true }
  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  expect(wrapper).toMatchSnapshot()
})

it('shows edit mode when you click edit', async () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  wrapper.findAll('.comment-item__overlay__item').at(0).trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('emits update-comment event when you press enter in editing mode', async () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  wrapper.findAll('.comment-item__overlay__item').at(0).trigger('click')
  await wrapper.vm.$nextTick()

  wrapper.find('comment-edit-box-stub').vm.$emit('enter')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['update-comment']).toBeDefined()
})

it('emits delete comment event', async () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  wrapper.findAll('.comment-item__overlay__item').at(1).trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['delete-comment']).toHaveLength(1)
})

it('emits delete comment thread event', async () => {
  const store = newStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

  const wrapper = shallowMount(
    CommentItem, { localVue, store, propsData, mocks, stubs }
  )
  wrapper.findAll('.comment-item__overlay__item').at(2).trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['delete-comment-thread']).toHaveLength(1)
})

describe('author', () => {
  it('is computed correctly when comment is authored by current user', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', joe)
    store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

    const wrapper = shallowMount(
      CommentItem, { localVue, store, propsData, mocks, stubs }
    )

    expect(wrapper.find('comment-profile-stub').props('author')).toEqual(joe)
  })

  it('is computed correctly when comment is authored by other user', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', sam)
    store.commit('team/SET_MEMBERSHIPS', [joeMembership, samMembership])

    const wrapper = shallowMount(
      CommentItem, { localVue, store, propsData, mocks, stubs }
    )

    expect(wrapper.find('comment-profile-stub').props('author')).toEqual(joeMembership)
  })

  it('is computed correctly when current user does not have access to specific author info', () => {
    const store = newStore()

    const wrapper = shallowMount(
      CommentItem, { localVue, store, propsData, mocks, stubs }
    )

    expect(wrapper.find('comment-profile-stub').props('author')).toEqual({
      id: v7.id,
      image: v7.image,
      first_name: v7.name,
      last_name: ''
    })
  })
})
