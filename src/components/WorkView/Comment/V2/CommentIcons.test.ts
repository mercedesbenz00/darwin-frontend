import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Ref, ref } from 'vue'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildTeamPayload,
  buildV2CommentThreadPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import { payloadToEditorThread } from '@/engineV2/commentHelpers'
import { Editor } from '@/engineV2/editor'

import CommentIcons from './CommentIcons.vue'

jest.mock('@/engineV2/workers/FramesLoaderWorker')
jest.mock('uuid', () => ({ v4: (): string => 'fake-view-uuid' }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let provide: { editorV2: Ref<Editor> }
let propsData: { viewId: string }
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

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_TEAMS', [buildTeamPayload({ id: 1, slug: 'v7' })])
  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 10, team_id: 1, team_slug: 'v7' }))

  // handles loading of frames
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: { slot_sections: [] }
  })

  provide = { editorV2: initEditor(store) }
  propsData = { viewId: provide.editorV2.value!.activeView.id }
})

describe('when no threads', () => {
  it('renders', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, mocks, propsData, store, provide })
    expect(wrapper.find('.comment-icons').exists()).toBe(true)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, mocks, propsData, store, provide })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when some threads', () => {
  beforeEach(() => {
    const thread1 = buildV2CommentThreadPayload({ id: 'thread-1-id', section_index: 0 })
    const thread2 = buildV2CommentThreadPayload({ id: 'thread-2-id', section_index: 0 })

    provide.editorV2.value.activeView.commentManager.setCommentThreads(
      [thread1, thread2].map(payloadToEditorThread)
    )
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, mocks, propsData, store, provide })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders thread icons', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, mocks, propsData, store, provide })
    expect(wrapper.findAll('comment-thread-icon-stub').length).toBe(2)
  })
})
