import { createLocalVue, shallowMount } from '@vue/test-utils'

import CreateDatasetCard from '@/components/Dataset/CreateDatasetCard.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)

it('matches snapshot', () => {
  const wrapper = shallowMount(CreateDatasetCard, { localVue })
  expect(wrapper).toMatchSnapshot()
})
