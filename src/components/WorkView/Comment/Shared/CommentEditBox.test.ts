import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'
import { Mentionable } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import VClickOutside from '@/directives/click-outside'

import CommentEditBox from './CommentEditBox.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', VClickOutside)

const v7 = buildTeamPayload({ id: 7 })

const memberships = [
  buildMembershipPayload({ id: 1, first_name: 'Sam', last_name: 'A', team_id: v7.id, user_id: 1 }),
  buildMembershipPayload({ id: 2, first_name: 'Jim', last_name: 'A', team_id: v7.id, user_id: 2, role: 'annotator' }),
  buildMembershipPayload({ id: 3, first_name: 'Mike', last_name: 'A', team_id: v7.id, user_id: 3, role: 'annotator' })
]

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { Mentionable }

const createMockKeyEvent = (params: { key: string, shiftKey?: boolean }) => ({
  key: params.key,
  shiftKey: params.shiftKey,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
})

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', memberships)
})

it('CommentEditBox snapshot testing', () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders textarea with the right placeholder', () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  expect(wrapper.find('textarea-autosize-stub').exists()).toBeTruthy()
  expect(wrapper.find('textarea-autosize-stub').attributes('placeholder')).toBe('Reply')
})

it('textarea emits cancel event', async () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  await wrapper.find('textarea-autosize-stub')
    .vm.$emit('keydown', createMockKeyEvent({ key: 'Escape' }))
  expect(wrapper.emitted().cancel).toBeDefined()
})

it('textarea emits enter event when you press enter', async () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  await wrapper.find('textarea-autosize-stub')
    .vm.$emit('keydown', createMockKeyEvent({ key: 'Enter', shiftKey: false }))
  expect(wrapper.emitted().enter).toBeDefined()
})

it("textarea doesn't emit enter event when you press shift + enter", async () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  await wrapper.find('textarea-autosize-stub')
    .vm.$emit('keydown', createMockKeyEvent({ key: 'Enter', shiftKey: true }))
  expect(wrapper.emitted().enter).toBeUndefined()
})

it('when mentioning popover is open, never handle enter event', async () => {
  const wrapper = shallowMount(CommentEditBox, { localVue, store, stubs })
  await emitRootStub(wrapper, 'open')
  await wrapper.find('textarea-autosize-stub')
    .vm.$emit('keydown', createMockKeyEvent({ key: 'Enter', shiftKey: false }))
  expect(wrapper.emitted().enter).toBeUndefined()
})
