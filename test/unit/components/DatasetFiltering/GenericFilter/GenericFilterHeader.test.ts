import { createLocalVue, shallowMount } from '@vue/test-utils'

import { GenericFilterHeader } from '@/components/DatasetFiltering/GenericFilter/Common'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const slots = {
    content: '<div>Title</div>',
    title: '<div>Title</div>'
  }
  const wrapper = shallowMount(GenericFilterHeader, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
