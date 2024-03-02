import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import AnnotationCredits from '@/components/Plans/Product/AnnotationCredits/EditPlanTeaser.vue'
import { SubscriptionPlanName } from '@/components/Plans/Product/utils'

const localVue = createLocalVue()

let propsData: {
  amount: number
  plan: SubscriptionPlanName
}
const stubs: Stubs = { 'lottie-animation': true }

const itMatchesSnapshot = () => it('matches snaphsot', () => {
  const wrapper = shallowMount(AnnotationCredits, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when amount is 0', () => {
  beforeEach(() => {
    propsData = { amount: 0, plan: 'freemium' }
  })

  itMatchesSnapshot()
})

const availablePlans: SubscriptionPlanName[] = ['freemium', 'team', 'business', 'enterprise']
availablePlans.forEach((plan) => {
  describe(`when plan is ${plan}`, () => {
    beforeEach(() => {
      propsData = { amount: 10, plan }
    })

    itMatchesSnapshot()
  })
})
