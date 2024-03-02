import { setActivePinia, createPinia } from 'pinia'

import { buildV2CommentPayload, buildV2CommentThreadPayload } from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { useCommentStore } from '@/pinia/useCommentStore'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  createV2Comment: jest.fn(),
  createV2CommentThread: jest.fn(),
  deleteV2Comment: jest.fn(),
  deleteV2CommentThread: jest.fn(),
  loadV2Comments: jest.fn(),
  loadV2CommentThreads: jest.fn(),
  updateV2Comment: jest.fn(),
  updateV2CommentThread: jest.fn()
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

it('initializes', () => {
  expect(() => useCommentStore()).not.toThrow()
})

const unresolvedThread = (): CommentStore['threads'][0] =>
  buildV2CommentThreadPayload({
    id: 'fake-thread-id',
    resolved: false,
    dataset_item_id: 'fake-item-id'
  })

type CommentStore = ReturnType<typeof useCommentStore>

const pushThread = (store: CommentStore, thread: CommentStore['threads'][0]): void => {
  store.threads.push(thread)
  store.threadsById[thread.id] = thread
}

const pushComment = (store: CommentStore, comment: CommentStore['comments'][0]): void => {
  store.comments.push(comment)
  store.commentsById[comment.id] = comment
}

const commentForThread =
  (thread: CommentStore['threads'][0], id = 'fake-comment-id'): CommentStore['comments'][0] =>
    buildV2CommentPayload({ id, comment_thread_id: thread.id })

describe('actions.setTeamSlug', () => {
  it('sets team slug', () => {
    const store = useCommentStore()
    expect(store.teamSlug).toEqual(null)
    store.setTeamSlug('v7')
    expect(store.teamSlug).toEqual('v7')
  })
})

describe('actions.loadCommentThreads', () => {
  it('loads comment threads for a dataset item', async () => {
    const thread = unresolvedThread()
    jest.spyOn(backend, 'loadV2CommentThreads').mockResolvedValue({ data: [thread] })
    const store = useCommentStore()
    store.setTeamSlug('v7')
    await store.loadCommentThreads('fake-item-id')
    expect(store.threads).toEqual([thread])
    expect(store.threadsById[thread.id]).toEqual(thread)
  })

  it('does nothing if backend fails', async () => {
    jest.spyOn(backend, 'loadV2CommentThreads').mockResolvedValue({ error: fakeError })
    const store = useCommentStore()
    store.setTeamSlug('v7')
    await store.loadCommentThreads('fake-item-id')
    expect(store.threads).toEqual([])
    expect(store.threadsById).toEqual({})
  })
})

describe('actions.addNewCommentThread', () => {
  it('pushes new thread to store', () => {
    const store = useCommentStore()
    store.setTeamSlug('v7')
    store.addNewCommentThread('foo', {
      threadId: 'bar',
      authorId: 1,
      boundingBox: { x: 10, y: 10, w: 50, h: 30 },
      sectionIndex: null,
      slotName: 'baz'
    })

    expect(store.threads[0]).toEqual(expect.objectContaining({
      isNew: true,
      id: 'bar',
      dataset_item_id: 'foo',
      author_id: 1,
      bounding_box: { x: 10, y: 10, w: 50, h: 30 },
      section_index: null,
      slot_name: 'baz'
    }))
    expect(store.threadsById.bar!).toEqual(store.threads[0])
  })
})

describe('actions.saveCommentThread', () => {
  it('saves and updates unsaved thread', async () => {
    const store = useCommentStore()
    store.setTeamSlug('v7')
    const thread = unresolvedThread()
    thread.isNew = true
    pushThread(store, thread)
    const comment = commentForThread(thread)
    comment.isNew = true
    pushComment(store, comment)

    const insertDate = '2025-01-01T00:00:00'

    jest
      .spyOn(backend, 'createV2CommentThread')
      .mockResolvedValue({
        data: {
          ...thread,
          id: 'fake-new-id',
          inserted_at: insertDate,
          updated_at: insertDate,
          resolved: true
        }
      })

    const savedComment = {
      ...comment,
      id: 'fake-new-comment-id',
      inserted_at: insertDate,
      updated_at: insertDate

    }
    delete savedComment.isNew

    jest.spyOn(backend, 'loadV2Comments').mockResolvedValue({
      data: [savedComment]
    })

    await store.saveCommentThread(thread.id)

    expect(store.threads.length).toBe(1)
    expect(store.threads[0]).toEqual(store.threadsById['fake-new-id'])
    expect(store.threadsById['fake-new-id']?.isNew).toBe(false)
    expect(store.threadsById['fake-new-id']?.inserted_at).toBe(insertDate)
    expect(store.threadsById['fake-new-id']?.updated_at).toBe(insertDate)

    expect(store.comments.length).toBe(1)
    expect(store.comments[0]).toEqual(store.commentsById['fake-new-comment-id'])
    expect(store.commentsById['fake-new-comment-id']?.isNew).toBe(undefined)
    expect(store.commentsById['fake-new-comment-id']?.inserted_at).toBe(insertDate)
    expect(store.commentsById['fake-new-comment-id']?.updated_at).toBe(insertDate)
  })
})

describe('actions.resolveCommentThread', () => {
  it('updates and pushes comment thread into store', async () => {
    const thread = unresolvedThread()

    jest
      .spyOn(backend, 'updateV2CommentThread')
      .mockResolvedValue({ data: { ...thread, resolved: true } })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    await store.resolveCommentThread(thread.id)
    expect(store.threads[0].resolved).toBe(true)
    expect(store.threadsById[thread.id]!.resolved).toBe(true)
  })

  it('makes no changes if backend fails', async () => {
    jest
      .spyOn(backend, 'updateV2CommentThread')
      .mockResolvedValue({ error: fakeError })

    const store = useCommentStore()
    store.setTeamSlug('v7')

    const thread = unresolvedThread()
    pushThread(store, thread)

    await store.resolveCommentThread(thread.id)
    expect(store.threads[0].resolved).toBe(false)
    expect(store.threadsById[thread.id]!.resolved).toBe(false)
  })
})

describe('actions.deleteCommentThread', () => {
  it('deletes comment thread from store', async () => {
    const thread = unresolvedThread()
    jest
      .spyOn(backend, 'deleteV2CommentThread')
      .mockResolvedValue({ data: thread })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)

    await store.deleteCommentThread('fake-thread-id')
    expect(store.threads).toEqual([])
    expect(store.threadsById).toEqual({})
  })

  it('deletes associated comments', async () => {
    const thread = unresolvedThread()
    jest
      .spyOn(backend, 'deleteV2CommentThread')
      .mockResolvedValue({ data: thread })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, commentForThread(thread, 'foo'))
    pushComment(store, commentForThread(thread, 'bar'))

    expect(store.comments.length).toEqual(2)
    await store.deleteCommentThread('fake-thread-id')
    expect(store.comments.length).toEqual(0)
    expect(store.commentsById).toEqual({})
  })

  it('unsets active thread', async () => {
    const thread = unresolvedThread()
    jest
      .spyOn(backend, 'deleteV2CommentThread')
      .mockResolvedValue({ data: thread })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)

    await store.setActiveThreadId(thread.id)
    await store.deleteCommentThread('fake-thread-id')
    expect(store.activeThreadId).toBe(null)
    expect(store.activeThread).toBe(null)
  })

  it('makes no changes if backend fails', async () => {
    jest
      .spyOn(backend, 'updateV2CommentThread')
      .mockResolvedValue({ error: fakeError })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    const thread = unresolvedThread()
    pushThread(store, thread)

    await store.deleteComment(thread.id)
    expect(store.threads).toEqual([thread])
    expect(store.threadsById).toEqual({ [thread.id]: thread })
  })
})

describe('actions.loadComments', () => {
  it('loads comments for a comment thread', async () => {
    const thread = unresolvedThread()
    const comment = commentForThread(thread)

    jest.spyOn(backend, 'loadV2Comments').mockResolvedValue({ data: [comment] })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)

    expect(store.comments).toEqual([])
    await store.loadComments(thread.id)
    expect(store.comments).toEqual([comment])
    expect(store.commentsById).toEqual({ [comment.id]: comment })
  })
})

describe('actions.updateComment', () => {
  it('updates and pushes comment into store', async () => {
    const thread = unresolvedThread()
    const comment = commentForThread(thread)
    jest
      .spyOn(backend, 'updateV2Comment')
      .mockResolvedValue({ data: { ...comment, body: 'New body' } })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, comment)

    await store.updateComment(comment.id, 'New body')
    expect(store.comments[0].body).toEqual('New body')
    expect(store.commentsById[comment.id]!.body).toEqual('New body')
  })

  it('if new, creates and pushes, marks comment as no longer new', async () => {
    const thread = unresolvedThread()
    const comment = { ...commentForThread(thread), isNew: true }
    jest
      .spyOn(backend, 'createV2Comment')
      .mockResolvedValue({ data: { ...comment, body: 'New body' } })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, { ...comment, isNew: true })

    await store.updateComment(comment.id, 'New body')
    expect(store.comments[0].body).toEqual('New body')
    expect(store.comments[0].isNew).toBe(false)
    expect(store.commentsById[comment.id]!.isNew).toBe(false)
    expect(store.commentsById[comment.id]!.body).toEqual('New body')
  })

  it('makes no changes if backend fails', async () => {
    const thread = unresolvedThread()
    const comment = commentForThread(thread)
    jest
      .spyOn(backend, 'updateV2Comment')
      .mockResolvedValue({ error: fakeError })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, comment)

    await store.updateComment(comment.id, 'New body')
    expect(store.comments[0].body).not.toEqual('New body')
    expect(store.commentsById[comment.id]!.body).not.toEqual('New body')
  })
})

describe('actions.deleteComment', () => {
  it('removes comment from store', async () => {
    const thread = unresolvedThread()
    const comment = commentForThread(thread)
    jest
      .spyOn(backend, 'deleteV2Comment')
      .mockResolvedValue({ data: comment })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, comment)

    await store.deleteComment(comment.id)
    expect(store.comments).toEqual([])
    expect(store.commentsById).toEqual({})
  })

  it('makes no changes if backend fails', async () => {
    const thread = unresolvedThread()
    const comment = commentForThread(thread)
    jest
      .spyOn(backend, 'deleteV2Comment')
      .mockResolvedValue({ error: fakeError })

    const store = useCommentStore()
    store.setTeamSlug('v7')
    pushThread(store, thread)
    pushComment(store, comment)

    await store.deleteComment(comment.id)
    expect(store.comments).toEqual([comment])
    expect(store.commentsById).toEqual({ [comment.id]: comment })
  })
})

it('can set, unset and retrieve the currently active thread', () => {
  const thread1 = buildV2CommentThreadPayload({ id: 'foo' })
  const thread2 = buildV2CommentThreadPayload({ id: 'bar' })

  const store = useCommentStore()
  store.setTeamSlug('v7')
  pushThread(store, thread1)
  pushThread(store, thread2)

  store.setActiveThreadId('foo')
  expect(store.activeThread).toEqual(thread1)
  store.setActiveThreadId('bar')
  expect(store.activeThread).toEqual(thread2)

  store.unsetActiveThreadId()
  expect(store.activeThread).toEqual(null)

  store.setActiveThreadId('baz')
  expect(store.activeThread).toEqual(null)
})
