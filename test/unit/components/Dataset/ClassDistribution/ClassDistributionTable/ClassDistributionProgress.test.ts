import { createLocalVue, shallowMount } from '@vue/test-utils'

import ClassDistributionProgress from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassDistributionProgress.vue'

const localVue = createLocalVue()

let propsData: {
  color: string
  count: number
  maxCount: number
}

beforeEach(() => {
  propsData = {
    color: 'rgba(0, 0, 0, 0.1)',
    count: 5,
    maxCount: 10
  }
})

describe('when count is zero', () => {
  beforeEach(() => { propsData.count = 0 })
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistributionProgress, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when count is not zero', () => {
  beforeEach(() => { propsData.count = 5 })
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassDistributionProgress, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})
