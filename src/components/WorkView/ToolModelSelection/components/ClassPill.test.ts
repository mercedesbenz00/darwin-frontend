import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { RGBA } from '@/utils'

import ClassPill from './ClassPill.vue'

const localVue = createLocalVue()
localVue.use(VTooltip)

let propsData: {
  color: RGBA,
  name: string
}

it('matches snapshot', () => {
  propsData = {
    color: { r: 10, g: 20, b: 30, a: 1.0 },
    name: 'My Class Name'
  }

  const wrapper = shallowMount(ClassPill, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
