import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import VideoCommentThreadIndicator from '@/components/WorkView/VideoScrubber/VideoCommentThreadIndicator.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = {
  $theme: createMockTheme()
}

const changeWidth = jest.fn()
const checkParentSize = jest.fn()
const moveHorizontally = jest.fn()

const stubs: Stubs = {
  VueDraggableResizable: {
    template: `
      <div class="vue-draggable-resizable-stub">
        <slot name="ml" />
        <slot name="mr" />
        <slot />
      </div>
    `,
    methods: {
      changeWidth,
      checkParentSize,
      moveHorizontally
    }
  }
}
let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  frameIndex: number
  count: number
  editor: Editor
  yIndex: number
}

beforeEach(() => {
  store = createTestStore()
  store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 4)

  editor = new Editor(new ItemManager(store), store)
  propsData = {
    frameIndex: 5,
    count: 3,
    editor,
    yIndex: 1
  }

  changeWidth.mockClear()
  checkParentSize.mockClear()
  moveHorizontally.mockClear()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoCommentThreadIndicator, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('sets x and w on child', async () => {
  const wrapper = shallowMount(VideoCommentThreadIndicator, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()
  expect(checkParentSize).toHaveBeenCalled()
  expect(changeWidth).toHaveBeenCalledWith(4)
  expect(moveHorizontally).toHaveBeenCalledWith(20)
})

it('updates x and w on child when frameLineWidth changes', async () => {
  const wrapper = shallowMount(VideoCommentThreadIndicator, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()
  store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 20)
  await wrapper.vm.$nextTick()
  expect(checkParentSize).toHaveBeenCalled()
  expect(changeWidth).toHaveBeenCalledWith(20)
  expect(moveHorizontally).toHaveBeenCalledWith(20)
})

it('jumps to the frame on click', async () => {
  jest.spyOn(editor, 'jumpToFrame')
  const wrapper = shallowMount(VideoCommentThreadIndicator, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('.video-comment-thread-indicator').trigger('click')
  expect(editor.jumpToFrame).toBeCalledWith(5)
})
