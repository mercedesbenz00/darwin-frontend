import { createLocalVue, shallowMount } from '@vue/test-utils'

import DatasetItemSkeletonCard from './DatasetItemSkeletonCard.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetItemSkeletonCard, { localVue })
  expect(wrapper).toMatchSnapshot()
})
