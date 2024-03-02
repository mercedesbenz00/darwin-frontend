import { shallowMount, createLocalVue } from '@vue/test-utils'

import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import StorageV3 from '@/components/Admin/TeamDetails/StorageV3.vue'
import TeamSection from '@/components/Admin/TeamDetails/TeamSection.vue'
import TeamSectionField from '@/components/Admin/TeamDetails/TeamSectionField.vue'

const localVue = createLocalVue()
const periodStart = 1000

const v7 = buildAdminTeamPayload({
  name: 'V7',
  subscription_period_start: periodStart,
  customer_v3: {
    customer_subscription: buildCustomerSubscriptionPayload({
      storage_standard: 100,
      storage_standard_max_in_period: 200,
      storage_standard_max_in_period_at: periodStart,
      storage_used: 50
    })
  }
})

it('matches snapshot', () => {
  const propsData = { team: v7 }
  const stubs = { TeamSection, TeamSectionField }
  const wrapper = shallowMount(StorageV3, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
