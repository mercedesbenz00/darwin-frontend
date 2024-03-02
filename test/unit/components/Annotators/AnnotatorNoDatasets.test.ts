import { shallowMount, createLocalVue } from '@vue/test-utils'

import AnnotatorNoDatasets from '@/components/Annotators/AnnotatorNoDatasets.vue'

const localVue = createLocalVue()

it('matches snapshot with loaded datasets', () => {
  const wrapper = shallowMount(AnnotatorNoDatasets, { localVue })
  expect(wrapper).toMatchSnapshot()
})
