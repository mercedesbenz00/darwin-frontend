import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload,
  buildV2CommentPayload
} from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import { CommentStore, useCommentStore } from '@/pinia/useCommentStore'
import { installCommonComponents } from '@/plugins/components'

import CommentItem from './CommentItem.vue'

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let pinia: ReturnType<typeof createTestingPinia>
let commentStore: CommentStore
let propsData: {
  commentId: string
  teamId: number
  isResolvable?: boolean
  isThreadDeletable?: boolean

}
const mocks = { $theme: createMockTheme() }
const stubs = { 'v-popover': VPopover }

const initCommentStore = (): CommentStore => {
  const commentStore = useCommentStore()
  commentStore.teamSlug = 'v7'
  return commentStore
}

const pushComment = (store: CommentStore, comment: CommentStore['comments'][0]): void => {
  store.comments.push(comment)
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_TEAMS', [buildTeamPayload({ id: 1, slug: 'v7' })])
  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 10, team_id: 1, team_slug: 'v7' }))
  pinia = createTestingPinia()
  commentStore = initCommentStore()

  const comment =
    buildV2CommentPayload({ id: 'comment-1', author_id: 555, comment_thread_id: 'thread-id' })

  pushComment(commentStore, comment)

  const membership = buildMembershipPayload({
    id: 55, user_id: 555, team_id: 5, first_name: 'Joe', last_name: 'Schmoe'
  })
  store.commit('team/SET_MEMBERSHIPS', [membership])

  propsData = { commentId: comment.id, teamId: 5 }
})

describe('default props, own comment', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: commentStore.comments[0].author_id }))
    const abilities = [{ subject: 'comment', actions: ['update_comment', 'delete_comment'] }]
    store.commit('auth/SET_ABILITIES', abilities)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper.find('.comment-item__body--editing').exists()).toBe(false)
    expect(wrapper.find('.comment-item__resolve').exists()).toBe(false)

    expect(wrapper.find('.comment-item__overlay__item--edit-comment[disabled]').exists())
      .toBe(false)
    expect(wrapper.find('.comment-item__overlay__item--delete-comment[disabled]').exists())
      .toBe(false)

    expect(wrapper.find('.comment-item__overlay__item--delete-thread').exists()).toBe(false)
  })

  it('renders as not edited', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper.find('.comment-item__body--editing').exists()).toBe(false)
  })

  describe('when new comment', () => {
    beforeEach(() => {
      commentStore.comments[0].isNew = true
    })

    it('matches snapshot', () => {
      const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
      expect(wrapper).toMatchSnapshot()
    })

    it('renders as edited', () => {
      const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
      expect(wrapper.find('.comment-item__body--editing').exists()).toBe(true)
    })
  })

  it('allows editing comment', async () => {
    jest.spyOn(commentStore, 'updateComment')
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    await wrapper.find('.comment-item__overlay__item--edit-comment').trigger('click')
    await wrapper.find('comment-edit-box-stub').vm.$emit('input', 'new body')
    await wrapper.find('positive-button-stub').vm.$emit('click')
    expect(commentStore.updateComment).toHaveBeenCalledWith('comment-1', 'new body')
  })

  it('allows deleting comment', async () => {
    jest.spyOn(commentStore, 'deleteComment')
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    await wrapper.find('.comment-item__overlay__item--delete-comment').trigger('click')
    expect(commentStore.deleteComment).toHaveBeenCalledWith('comment-1')
  })
})

describe("default props, other user's comment", () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: -5 }))
    store.commit('auth/SET_ABILITIES', [])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper.find('.comment-item__body--editing').exists()).toBe(false)
    expect(wrapper.find('.comment-item__resolve').exists()).toBe(false)

    expect(wrapper.find('.comment-item__overlay__item--edit-comment[disabled]').exists())
      .toBe(true)
    expect(wrapper.find('.comment-item__overlay__item--delete-comment[disabled]').exists())
      .toBe(true)

    expect(wrapper.find('.comment-item__overlay__item--delete-thread').exists()).toBe(false)
  })
})

describe('when thread deletable', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: commentStore.comments[0].author_id }))
    store.commit('auth/SET_ABILITIES', [])
    propsData.isThreadDeletable = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper.find('.comment-item__overlay__item--delete-thread').exists()).toBe(true)
  })

  it('allows deleting thread', async () => {
    jest.spyOn(commentStore, 'deleteCommentThread')
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    await wrapper.find('.comment-item__overlay__item--delete-thread').trigger('click')
    expect(commentStore.deleteCommentThread).toHaveBeenCalledWith('thread-id')
  })
})

describe('when resolvable', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: commentStore.comments[0].author_id }))
    store.commit('auth/SET_ABILITIES', [])
    propsData.isResolvable = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    expect(wrapper.find('.comment-item__resolve').exists()).toBe(true)
  })

  it('allows resolving thread', async () => {
    jest.spyOn(commentStore, 'resolveCommentThread')
    const wrapper = shallowMount(CommentItem, { localVue, mocks, pinia, propsData, store, stubs })
    await wrapper.find('.comment-item__resolve').trigger('click')
    expect(commentStore.resolveCommentThread).toHaveBeenCalledWith('thread-id')
  })
})
