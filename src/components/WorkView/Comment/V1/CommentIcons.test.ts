import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCommentThread, buildLoadedVideo } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View } from '@/engine/models'

import CommentIcons from './CommentIcons.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: { view: View }

let editor: Editor
beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

describe('when image loaded', () => {
  beforeEach(() => {
    const commentThreads = [
      buildCommentThread({ id: 1, workflow_id: 1 }),
      buildCommentThread({ id: 2, workflow_id: 1 }),
      buildCommentThread({ id: 3, workflow_id: 1 })
    ]
    store.commit('comment/SET_THREADS', commentThreads)

    propsData = { view: editor.viewsList[0] }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('loads icon for each thread', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, propsData, store })
    expect(wrapper.findAll('comment-thread-icon-stub').length).toBe(3)
  })
})

describe('when video loaded', () => {
  beforeEach(() => {
    const commentThreads = [
      buildCommentThread({ id: 1, frame_index: 0, workflow_id: 1 }),
      buildCommentThread({ id: 2, frame_index: 0, workflow_id: 1 }),
      buildCommentThread({ id: 3, frame_index: 1, workflow_id: 1 })
    ]
    store.commit('comment/SET_THREADS', commentThreads)

    propsData = { view: editor.viewsList[0] }
    propsData.view.loadedVideo = buildLoadedVideo({ id: 1, currentFrameIndex: 0 })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('loads icon for each thread', () => {
    const wrapper = shallowMount(CommentIcons, { localVue, propsData, store })
    expect(wrapper.findAll('comment-thread-icon-stub').length).toBe(2)
  })
})
