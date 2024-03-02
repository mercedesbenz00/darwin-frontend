import { createLocalVue, shallowMount } from '@vue/test-utils'

import FeatureListV2 from '@/components/Plans/Product/AnnotationCredits/FeatureListV2.vue'
import { PlanFeature } from '@/components/Plans/Product/utils'

const localVue = createLocalVue()

let propsData: {
  features: PlanFeature[]
}

it('matches snapshot', () => {
  propsData = {
    features: [
      { label: 'Feature 1', or: true, enabled: true },
      { label: 'Feature 2' },
      { label: 'Feature 2', enabled: true }
    ]
  }
  const wrapper = shallowMount(FeatureListV2, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
