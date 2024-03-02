import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { Ref, ref } from 'vue'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildTeamPayload,
  buildV2CommentPayload,
  buildV2CommentThreadPayload
} from 'test/unit/factories'

import { Editor } from '@/engineV2/editor'
import { CommentStore, useCommentStore } from '@/pinia/useCommentStore'

import CommentThread from './CommentThread.vue'

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let pinia: ReturnType<typeof createTestingPinia>
let commentStore: CommentStore
const mocks = { $theme: createMockTheme() }

const initEditor = (store: ReturnType<typeof createTestStore>): Ref =>
  ref<Editor>(createEditorV2(store))

const initCommentStore = (): CommentStore => {
  const commentStore = useCommentStore()
  commentStore.teamSlug = 'v7'
  return commentStore
}

const pushThread = (store: CommentStore, thread: CommentStore['threads'][0]): void => {
  store.threads.push(thread)
  store.threadsById[thread.id] = thread
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
})

describe('when no active thread', () => {
  it('renders nothing', () => {
    const provide = { editorV2: initEditor(store) }
    const wrapper = shallowMount(CommentThread, { localVue, mocks, pinia, store, provide })
    expect(wrapper.html()).toEqual('')
  })
})

describe('when active thread with new comment', () => {
  beforeEach(() => {
    const thread = buildV2CommentThreadPayload({ id: 'thread-id', dataset_item_id: 'item-id' })
    pushThread(commentStore, thread)

    commentStore.activeThreadId = thread.id

    const comment1 = buildV2CommentPayload({ id: 'comment-1', comment_thread_id: 'thread-id' })
    pushComment(commentStore, { ...comment1, isNew: false })
    const comment2 = buildV2CommentPayload({ id: 'comment-2', comment_thread_id: 'thread-id' })
    pushComment(commentStore, { ...comment2, isNew: true })
  })

  it('matches snapshot', () => {
    const provide = { editorV2: initEditor(store) }
    const wrapper = shallowMount(CommentThread, { localVue, mocks, pinia, store, provide })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const provide = { editorV2: initEditor(store) }
    const wrapper = shallowMount(CommentThread, { localVue, mocks, pinia, store, provide })
    expect(wrapper.find('.comment-thread').exists()).toBe(true)
    expect(wrapper.findAll('comment-item-stub').length).toBe(2)
    expect(wrapper.text()).not.toContain('Reply')
  })
})

describe('when active thread with saved comments only', () => {
  beforeEach(() => {
    const thread = buildV2CommentThreadPayload({ id: 'thread-id', dataset_item_id: 'item-id' })
    pushThread(commentStore, thread)

    commentStore.activeThreadId = thread.id

    const comment1 = buildV2CommentPayload({ id: 'comment-1', comment_thread_id: 'thread-id' })
    pushComment(commentStore, comment1)
    const comment2 = buildV2CommentPayload({ id: 'comment-2', comment_thread_id: 'thread-id' })
    pushComment(commentStore, comment2)
  })

  it('matches snapshot', () => {
    const provide = { editorV2: initEditor(store) }
    const wrapper = shallowMount(CommentThread, { localVue, mocks, pinia, store, provide })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correctly', () => {
    const provide = { editorV2: initEditor(store) }
    const wrapper = shallowMount(CommentThread, { localVue, mocks, pinia, store, provide })
    expect(wrapper.find('.comment-thread').exists()).toBe(true)
    expect(wrapper.findAll('comment-item-stub').length).toBe(2)
    expect(wrapper.text()).toContain('Reply')
  })
})
