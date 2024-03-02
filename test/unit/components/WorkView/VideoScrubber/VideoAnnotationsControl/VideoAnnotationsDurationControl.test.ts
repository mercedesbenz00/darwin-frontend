import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import VideoAnnotationsDurationControl from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/VideoAnnotationsDurationControl.vue'

let store: ReturnType<typeof createTestStore>

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('input-auto-blur', stubDirectiveWithAttribute)

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsDurationControl, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('updates store when duration changes', async () => {
  const wrapper = shallowMount(VideoAnnotationsDurationControl, { localVue, store })
  await wrapper.find('small-numeric-input-stub').vm.$emit('input', 20)
  expect(store.state.workview.videoAnnotationDuration).toEqual(20)
})
