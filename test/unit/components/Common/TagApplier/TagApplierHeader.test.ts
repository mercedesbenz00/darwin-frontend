import { createLocalVue, shallowMount } from '@vue/test-utils'

import TagApplierHeader from '@/components/Common/TagApplier/TagApplierHeader.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(TagApplierHeader, { localVue })
  expect(wrapper).toMatchSnapshot()
})
