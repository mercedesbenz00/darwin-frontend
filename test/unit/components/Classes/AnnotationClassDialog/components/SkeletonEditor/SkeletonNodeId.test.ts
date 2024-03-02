import { createLocalVue, shallowMount } from '@vue/test-utils'

import SkeletonNodeId from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/SkeletonNodeId.vue'

const localVue = createLocalVue()

let propsData: {
  label: string
}

it('matches snapshot', () => {
  propsData = { label: 'Node Id' }
  const wrapper = shallowMount(SkeletonNodeId, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
