import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildCreditUsagePayloadV2 } from 'test/unit/factories'

import V2CreditBar from '@/components/Plans/Product/Usage/V2CreditBar.vue'
import { CreditUsagePayloadV2 } from '@/store/types'

const localVue = createLocalVue()

let propsData: {
  creditUsage: CreditUsagePayloadV2
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(V2CreditBar, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when zero usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayloadV2({
        ticks: [{
          action: 'api_call',
          price_per_action_cents: 1,
          price_per_action: 1,
          team_id: -1,
          tick_cost: 0
        }],
        remaining_credits: 100,
        used_credits: 0,
        total_credits: 100
      })
    }
  })

  itMatchesSnapshot()
})

describe('when some usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayloadV2({
        ticks: [{
          action: 'api_call',
          price_per_action_cents: 1,
          price_per_action: 1,
          team_id: -1,
          tick_cost: 30
        }],
        remaining_credits: 100,
        used_credits: 30,
        total_credits: 100
      })
    }
  })

  itMatchesSnapshot()
})

describe('when full usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayloadV2({
        ticks: [{
          action: 'api_call',
          price_per_action_cents: 1,
          price_per_action: 1,
          team_id: -1,
          tick_cost: 100
        }],
        remaining_credits: 100,
        used_credits: 100,
        total_credits: 100
      })
    }
  })

  itMatchesSnapshot()
})
