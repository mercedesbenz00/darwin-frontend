import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildCommentPayload,
  buildDatasetPayload,
  buildMembershipPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import Abilities from '@/plugins/abilities'
import {
  Ability,
  CommentPayload,
  DatasetPayload,
  MembershipPayload,
  WorkflowStagePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = createTestStore()
localVue.use(Abilities, store)

const FakeComponent = localVue.extend({ name: 'FakeComponent', template: '<div></div>' })
const wrapper = mount(FakeComponent, { localVue, store })

const abilities: Ability[] = [
  {
    actions: ['create_annotation_class'],
    conditions: { annotators_can_create_tags: true, team_id: 1 },
    subject: 'dataset'
  },
  {
    actions: ['delete_comment', 'update_comment'],
    conditions: { author_id: 3 },
    subject: 'comment'
  },
  { actions: ['delete_membership'], conditions: { user_id: 3 }, subject: 'all' },
  { actions: ['request_stages'], subject: 'all' },
  { actions: ['view_stage'], conditions: { assignee_id: 3 }, subject: 'stages' }
]

beforeEach(() => {
  store.commit('auth/SET_ABILITIES', abilities)
})

it('works with complex conditions', () => {
  const dataset1 = buildDatasetPayload({ team_id: 1, annotators_can_create_tags: true })
  const dataset2 = buildDatasetPayload({ team_id: 1, annotators_can_create_tags: false })
  const dataset3 = buildDatasetPayload({ team_id: 2, annotators_can_create_tags: true })

  const checkAuth = (resource: DatasetPayload) =>
    wrapper.vm.$can('create_annotation_class', { subject: 'dataset', resource })

  expect(checkAuth(dataset1)).toBe(true)
  expect(checkAuth(dataset2)).toBe(false)
  expect(checkAuth(dataset3)).toBe(false)
})

it('works with simpler conditions, multiple actions', () => {
  const checkAuth = (ability: string, resource: CommentPayload) =>
    wrapper.vm.$can(ability, { subject: 'comment', resource })

  const comment1 = buildCommentPayload({ author_id: 1 })

  expect(checkAuth('delete_comment', comment1)).toBe(false)
  expect(checkAuth('update_comment', comment1)).toBe(false)

  const comment2 = buildCommentPayload({ author_id: 3 })
  expect(checkAuth('delete_comment', comment2)).toBe(true)
  expect(checkAuth('update_comment', comment2)).toBe(true)
})

it('works when resource is an array', () => {
  const stage1 = buildWorkflowStagePayload({ assignee_id: 1 })
  const stage2 = buildWorkflowStagePayload({ assignee_id: null })
  const stage3 = buildWorkflowStagePayload({ assignee_id: 3 })

  const checkAuth = (resource: WorkflowStagePayload[]) =>
    wrapper.vm.$can('view_stage', { subject: 'stages', resource })

  expect(checkAuth([stage1, stage2])).toBe(false)
  expect(checkAuth([stage1, stage3])).toBe(true)
  expect(checkAuth([stage2, stage3])).toBe(true)
})

it('considers "all" to cover all subjects, when rule has conditions', () => {
  const checkAuth = (resource: MembershipPayload) =>
    wrapper.vm.$can('delete_membership', { subject: 'membership', resource })

  const membership1 = buildMembershipPayload({ user_id: 1 })
  const membership2 = buildMembershipPayload({ user_id: 3 })

  expect(checkAuth(membership1)).toBe(false)
  expect(checkAuth(membership2)).toBe(true)
})

it('considers "all" to cover all subjects, when rule has no conditions', () => {
  expect(wrapper.vm.$can('request_stages')).toBe(true)
  expect(wrapper.vm.$can('fake_ability')).toBe(false)
})
