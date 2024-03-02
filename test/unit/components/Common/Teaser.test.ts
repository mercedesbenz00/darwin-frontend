import { createLocalVue, shallowMount } from '@vue/test-utils'

import Teaser from '@/components/Common/Teaser.vue'

const localVue = createLocalVue()

let propsData: {
  title: string
  image: string
  description?: string
  textAlign?: string
}

beforeEach(() => {
  propsData = {
    title: 'Title',
    image: 'image.jpg'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Teaser, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with descriptions', () => {
  propsData.description = 'Description'
  const wrapper = shallowMount(Teaser, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with textAlign', () => {
  propsData.textAlign = 'left'
  const wrapper = shallowMount(Teaser, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
