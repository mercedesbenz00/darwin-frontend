import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildCommentThreadPayload, buildUserPayload } from 'test/unit/factories'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'

import CommentThread from '@/components/WorkView/Comment/V1/CommentThread.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View } from '@/engine/models'
import { getCommentThread } from '@/store/modules/comment/serializer'

jest.mock('@/engineV2/workers/FramesLoaderWorker')

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  view: View
}

const mocks = { $theme: createMockTheme() }

const model = {
  replyBox: 'reply-box-stub'
}

let editor

beforeEach(() => {
  store = createTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 5 }))

  const thread = getCommentThread(buildCommentThreadPayload({ id: 9 }))
  store.commit('comment/SET_THREADS', [thread])
  store.commit('comment/SELECT_COMMENT_THREAD', thread)

  editor = new Editor(new ItemManager(store), store)

  propsData = { view: editor.viewsList[0] }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentThread, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

itMatchesSnapshot()

it(`shows storage dialog on ${outOfSubscribedStorageError.code}`, async () => {
  const wrapper = shallowMount(CommentThread, { localVue, mocks, propsData, store })
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    error: outOfSubscribedStorageError
  })
  await wrapper.find(model.replyBox).vm.$emit('post')
  await flushPromises()
  expect(store.state.billing.outOfStorageDialogShown).toBe(true)
})
