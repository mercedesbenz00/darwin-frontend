import { createLocalVue, shallowMount } from '@vue/test-utils'

import AnnotationClassSection from '@/components/Classes/AnnotationClassDialog/components/Common/AnnotationClassSection.vue'

const localVue = createLocalVue()

let propsData: {
  title: string
  optional?: boolean
  error?: string
}

it('matches snapshot with title', () => {
  propsData = {
    title: 'Name'
  }
  const wrapper = shallowMount(AnnotationClassSection, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when optional', () => {
  propsData = {
    title: 'Name',
    optional: true
  }
  const wrapper = shallowMount(AnnotationClassSection, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with error', () => {
  propsData = {
    title: 'Name',
    error: 'Error'
  }
  const wrapper = shallowMount(AnnotationClassSection, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
