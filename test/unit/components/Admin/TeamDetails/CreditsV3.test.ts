import { shallowMount, createLocalVue } from '@vue/test-utils'

import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import CreditsV3 from '@/components/Admin/TeamDetails/CreditsV3.vue'
import TeamSection from '@/components/Admin/TeamDetails/TeamSection.vue'
import TeamSectionField from '@/components/Admin/TeamDetails/TeamSectionField.vue'

const localVue = createLocalVue()

const periodStart = 1000

const v7 = buildAdminTeamPayload({
  name: 'V7',
  subscription_period_start: periodStart,
  customer_v3: {
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 40,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 200,
      annotation_credits_standard_max_in_period_at: periodStart,
      annotation_credits_used: 50,
      seconds_per_automation_action: 22
    })
  }
})

it('matches snapshot', () => {
  const propsData = { team: v7 }
  const stubs = { TeamSection, TeamSectionField }
  const wrapper = shallowMount(CreditsV3, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
