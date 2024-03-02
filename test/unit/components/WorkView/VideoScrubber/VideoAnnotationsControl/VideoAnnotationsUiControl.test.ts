import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import VideoAnnotationsUiControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsUiControl.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const mocks = { $theme: createMockTheme() }

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsUiControl, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('updates the frame line width when mouse wheel', async () => {
  const wrapper = shallowMount(VideoAnnotationsUiControl, { localVue, mocks, store })
  expect(store.state.ui.workviewVideoFrameLineWidth).toBe(4)
  await wrapper.find('.video-annotations-ui-control').trigger('mousewheel', { deltaY: -2 })
  expect(store.state.ui.workviewVideoFrameLineWidth).toBe(5)
})
