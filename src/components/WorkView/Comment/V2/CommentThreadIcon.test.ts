import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import { Ref, ref } from 'vue'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetPayload,
  buildTeamPayload,
  buildV2CommentThreadPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import { Editor } from '@/engineV2/editor'
import { CommentStore, useCommentStore } from '@/pinia/useCommentStore'

import CommentThreadIcon from './CommentThreadIcon.vue'

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let pinia: ReturnType<typeof createTestingPinia>
let commentStore: CommentStore
let provide: { editorV2: Ref<Editor> }
let propsData: { threadId: string, viewId: string }
const mocks = { $theme: createMockTheme() }

const item = buildV2DatasetItemPayload({ id: 'item-id' })

const initEditor = (store: ReturnType<typeof createTestStore>): Ref<Editor> => {
  const editor: Editor = createEditorV2(
    store,
    { type: 'simple', views: [{ item, file: item.slots[0] }] }
  )
  // type inference here is acting weird, so we need to cast
  return ref(editor) as Ref<Editor>
}

const initCommentStore = (): CommentStore => {
  const commentStore = useCommentStore()
  commentStore.teamSlug = 'v7'
  return commentStore
}

const pushThread = (store: CommentStore, thread: CommentStore['threads'][0]): void => {
  store.threads.push(thread)
  store.threadsById[thread.id] = thread
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_TEAMS', [buildTeamPayload({ id: 1, slug: 'v7' })])
  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 10, team_id: 1, team_slug: 'v7' }))

  // handles loading of frames
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: { slot_sections: [] }
  })

  pinia = createTestingPinia()
  propsData = {
    threadId: 'fake-thread-id',
    viewId: 'fake-view-id'
  }

  provide = { editorV2: initEditor(store) }

  commentStore = initCommentStore()
  const thread = buildV2CommentThreadPayload({
    id: 'fake-thread-id',
    comment_count: 5,
    slot_name: provide.editorV2.value.activeView.fileManager.slotName
  })
  pushThread(commentStore, thread)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(
    CommentThreadIcon,
    { localVue, mocks, pinia, propsData, store, provide }
  )
  expect(wrapper).toMatchSnapshot()
})

it('renders icon', () => {
  const wrapper = shallowMount(
    CommentThreadIcon,
    { localVue, mocks, pinia, propsData, store, provide }
  )
  expect(wrapper.text()).toEqual('5')
})
