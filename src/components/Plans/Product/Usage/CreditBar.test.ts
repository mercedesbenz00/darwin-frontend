import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildCreditUsagePayload } from 'test/unit/factories'

import CreditBar from '@/components/Plans/Product/Usage/CreditBar.vue'
import { CreditUsagePayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: {
  creditUsage: CreditUsagePayload
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(CreditBar, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when zero usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayload({
        remaining_hours: 100,
        total_available_hours: 100,
        total_used_hours: 0,
        used_automation_hours: 0,
        used_human_hours: 0,
        used_model_hours: 0
      })
    }
  })

  itMatchesSnapshot()
})

describe('when some usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayload({
        remaining_hours: 50,
        total_available_hours: 100,
        total_used_hours: 60,
        used_automation_hours: 30,
        used_human_hours: 20,
        used_model_hours: 10
      })
    }
  })

  itMatchesSnapshot()
})

describe('when full usage', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayload({
        remaining_hours: 0,
        total_available_hours: 100,
        total_used_hours: 100,
        used_automation_hours: 60,
        used_human_hours: 30,
        used_model_hours: 10
      })
    }
  })

  itMatchesSnapshot()
})

describe('when partner', () => {
  beforeEach(() => {
    propsData = {
      creditUsage: buildCreditUsagePayload({
        remaining_hours: 0,
        total_available_hours: 100,
        total_used_hours: 30,
        used_automation_hours: 10,
        used_human_hours: 20,
        total_client_used_hours: 40
      })
    }
  })

  itMatchesSnapshot()
})
