import { createLocalVue, shallowMount } from '@vue/test-utils'

import ClassDistributionStatus from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassDistributionStatus.vue'
import { DistributionStatus } from '@/components/Dataset/ClassDistribution/types'

const localVue = createLocalVue()

const statuses = [
  DistributionStatus.BALANCED,
  DistributionStatus.LOW_DATA,
  DistributionStatus.MEDIUM_LOW_DATA,
  DistributionStatus.OVERREPRESENTED,
  DistributionStatus.UNDERREPRESENTED,
  DistributionStatus.VERY_LOW_DATA,
  DistributionStatus.VERY_OVERREPRESENTED,
  DistributionStatus.VERY_UNDERREPRESENTED
]

statuses.forEach((status) => {
  it(`matches snapshot when status is '${status}'`, () => {
    const wrapper = shallowMount(ClassDistributionStatus, { localVue, propsData: { status } })
    expect(wrapper).toMatchSnapshot()
  })
})
