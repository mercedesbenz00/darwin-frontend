import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { getFakeMouseEvent } from 'test/unit/factories/buildFakeMouseEvent'
import { emitRootStub } from 'test/unit/testHelpers'

import VideoAnnotationsScrubber from '@/components/WorkView/VideoScrubber/VideoAnnotationsScrubber.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.use(Vuex)

const checkParentSize = jest.fn()
const moveHorizontally = jest.fn()
const updateBounds = jest.fn()

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor,
  currentFrameIndex: number,
  scrollerSelector: string
}
const stubs: Stubs = {
  VueDraggableResizable: {
    template: `
      <div class="vue-draggable-resizable-stub">
        <slot />
      </div>
    `,
    methods: {
      checkParentSize,
      moveHorizontally,
      updateBounds
    }
  }
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    editor: new Editor(new ItemManager(store), store),
    currentFrameIndex: 0,
    scrollerSelector: 'selector'
  }
})

it('matches snapshot', () => {
  propsData.currentFrameIndex = 0
  const wrapper = shallowMount(VideoAnnotationsScrubber, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when currentFrameIndex is 2', () => {
  propsData.currentFrameIndex = 2
  const wrapper = shallowMount(VideoAnnotationsScrubber, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits frame-index-changed when dragging', async () => {
  const wrapper = shallowMount(VideoAnnotationsScrubber, { localVue, propsData, store, stubs })
  await emitRootStub(wrapper, 'dragging', 8)
  expect(wrapper.emitted()['frame-index-changed']).toEqual([[2]])
})

it('emits context-menu on right click', async () => {
  const wrapper = shallowMount(VideoAnnotationsScrubber, { localVue, propsData, store, stubs })
  const event = getFakeMouseEvent('contextmenu', {})
  await wrapper.find('.video-scrubber').element.dispatchEvent(event)
  expect(wrapper.emitted()['show-context-menu']).toEqual([[event]])
})

describe('when frame index changes', () => {
  let wrapper: Wrapper<Vue>
  let scrollIntoView: jest.Mock

  beforeEach(() => {
    propsData.currentFrameIndex = 20
    wrapper = shallowMount(VideoAnnotationsScrubber, { localVue, propsData, store, stubs })
    jest.spyOn(document, 'querySelector').mockReturnValue({
      scrollLeft: 0,
      clientWidth: 4 * 25
    } as any)
    const comp = wrapper.vm as any
    scrollIntoView = jest.fn()
    jest.spyOn(comp, 'scrubberRef', 'get').mockReturnValue({ scrollIntoView })
  })

  it('scrolls into the scrubber if the scrubber is not visible', async () => {
    expect(scrollIntoView).not.toBeCalled()
    await wrapper.setProps({ currentFrameIndex: 30 })
    expect(scrollIntoView).toBeCalled()
  })

  it('scrolls into the scrubber if the scrubber is not visible', async () => {
    expect(scrollIntoView).not.toBeCalled()
    await wrapper.setProps({ currentFrameIndex: 20 })
    expect(scrollIntoView).not.toBeCalled()
  })

  it('centers the scrubber', async () => {
    const mockScroller = {
      scrollLeft: 4 * 10,
      clientWidth: 4 * 25
    }

    jest.spyOn(document, 'querySelector').mockReturnValue(mockScroller as any)
    store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 20)
    await wrapper.vm.$nextTick()
    expect(mockScroller.scrollLeft).toEqual(360)
    await wrapper.vm.$nextTick()
    expect(checkParentSize).toBeCalled()
    expect(moveHorizontally).toBeCalled()
    expect(updateBounds).toBeCalled()
  })
})
