import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { TransitionGroup } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import AnimatingDraggable from '@/components/Common/AnimatingDraggable.vue'

const localVue = createLocalVue()
const stubs: Stubs = { TransitionGroup }

it('matches snapshot', () => {
  const wrapper = shallowMount(AnimatingDraggable, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when started dragging', async () => {
  const wrapper = shallowMount(AnimatingDraggable, { localVue, stubs })
  emitRootStub(wrapper, 'start')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot('before drag start')
  emitRootStub(wrapper, 'stop')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot('after drag end')
})
