import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCommentThreadPayload } from 'test/unit/factories/buildCommentThreadPayload'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import { linkThreads } from './linkThreads'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

const commentMutations = [
  'comment/DELETE_COMMENT_THREAD',
  'comment/DESELECT_ALL_COMMENT_THREADS',
  'comment/FOCUS_COMMENT_THREAD',
  'comment/SELECT_COMMENT_THREAD',
  'comment/SET_THREAD',
  'comment/RESOLVE_COMMENT_THREAD',
  'comment/UNFOCUS_ALL_COMMENT_THREADS'
]

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  linkThreads(store, editor)
})

const shouldTrigger = (key: string) => it(`${key} should trigger View.setCommentThreads`, () => {
  jest.spyOn(editor.viewsList[0].commentManager, 'setCommentThreads')

  store.commit(key)

  editor.viewsList[0].commentManager.setCommentThreads()
})

commentMutations.forEach(key => {
  shouldTrigger(key)
})

it('comment/ADD_THREAD should trigger View.setCommentThreads', () => {
  jest.spyOn(editor.viewsList[0].commentManager, 'setCommentThreads')

  store.commit('comment/ADD_THREAD', buildCommentThreadPayload())

  editor.viewsList[0].commentManager.setCommentThreads()
})

it('comment/SET_THREADS should trigger View.setCommentThreads', () => {
  jest.spyOn(editor.viewsList[0].commentManager, 'setCommentThreads')

  store.commit('comment/SET_THREADS', [buildCommentThreadPayload(), buildCommentThreadPayload()])

  editor.viewsList[0].commentManager.setCommentThreads()
})

it('comment/REPLACE_UNSAVED_THREAD should trigger View.setCommentThreads', () => {
  jest.spyOn(editor.viewsList[0].commentManager, 'setCommentThreads')

  store.commit('comment/REPLACE_UNSAVED_THREAD', buildCommentThreadPayload())

  editor.viewsList[0].commentManager.setCommentThreads()
})
