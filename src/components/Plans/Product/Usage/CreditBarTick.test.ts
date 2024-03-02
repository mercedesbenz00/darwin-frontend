import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import CreditBarTick from '@/components/Plans/Product/Usage/CreditBarTick.vue'
import { TickPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

type Props = {
  tick: TickPayload
  tickCount: number
  showTooltip: boolean
}

let propsData: Props

beforeEach(() => {
  propsData = {
    tick: {
      action: 'api_call',
      price_per_action_cents: 10,
      price_per_action: 10,
      team_id: -1,
      tick_cost: 10
    },
    tickCount: 100,
    showTooltip: false
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(CreditBarTick, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with tooltipe', () => {
  propsData.showTooltip = true

  const wrapper = shallowMount(CreditBarTick, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
