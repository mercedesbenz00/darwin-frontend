import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildRunningSessionPayload } from 'test/unit/factories'

import ModelCard from './ModelCard.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const model = buildRunningSessionPayload()
  const propsData = { model }
  const wrapper = shallowMount(ModelCard, { localVue, propsData })

  expect(wrapper).toMatchSnapshot()
})
