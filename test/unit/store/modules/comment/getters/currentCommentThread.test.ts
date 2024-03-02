import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentThread
} from 'test/unit/factories'

import { CommentThread } from '@/store/modules/comment/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('getter comment/currentCommentThread', () => {
  let commentThread: CommentThread

  beforeEach(() => {
    commentThread = buildCommentThread({ id: 0, author_id: 1 })
    const comment = buildComment({ id: 1, workflow_comment_thread_id: commentThread.id })
    commentThread.comments = [comment]
  })

  it('returns null when there is no selected comment thread', () => {
    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.getters['comment/currentCommentThread']).toBeNull()
  })

  it('returns selected comment thread', () => {
    commentThread.isSelected = true
    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.getters['comment/currentCommentThread']).toEqual(commentThread)
  })
})
