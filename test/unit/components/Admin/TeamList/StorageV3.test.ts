import { shallowMount, createLocalVue } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'
import { VPopover } from 'test/unit/stubs'

import StorageV3 from '@/components/Admin/TeamList/StorageV3.vue'

const localVue = createLocalVue()

localVue.use(VTooltip, { defaultHtml: true })

let team: ReturnType<typeof buildAdminTeamPayload>
let propsData: { team: typeof team }

const stubs = { VPopover }

const periodStart = 1000

beforeEach(() => {
  team = buildAdminTeamPayload({
    name: 'V7',
    subscription_period_start: periodStart,
    customer_v3: {
      customer_subscription: buildCustomerSubscriptionPayload({
        storage_standard: 1000,
        storage_standard_max_in_period: 1100,
        storage_standard_max_in_period_at: periodStart,
        storage_used: 300
      })
    }
  })
  propsData = { team }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StorageV3, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders correct remaining storage', async () => {
  const wrapper = shallowMount(StorageV3, { localVue, propsData, stubs })
  expect(wrapper.find('.storage__info').text()).toEqual('800')

  team.customer_v3!.customer_subscription.storage_used = 500

  await wrapper.setProps({ team: { ...team } })
  expect(wrapper.find('.storage__info').text()).toEqual('600')
})
