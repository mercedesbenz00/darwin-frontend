import { createLocalVue, shallowMount } from '@vue/test-utils'

import CardButton from '@/components/DatasetManagement/Card/V1/CardButton.vue'

const localVue = createLocalVue()
const stubs = ['router-link']

it('matches snapshot when given an url', () => {
  const propsData = { url: '/datasets' }
  const wrapper = shallowMount(CardButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given an url and disabled', () => {
  const propsData = { url: '/datasets', disabled: true }
  const wrapper = shallowMount(CardButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when used as action button', () => {
  const propsData = { }
  const wrapper = shallowMount(CardButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when used as action button and disabled', () => {
  const propsData = { disabled: true }
  const wrapper = shallowMount(CardButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits click', () => {
  const propsData = { }
  const wrapper = shallowMount(CardButton, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
  wrapper.find('div').trigger('click')
  expect(wrapper.emitted().click).toHaveLength(1)
})
