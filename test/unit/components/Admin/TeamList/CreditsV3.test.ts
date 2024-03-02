import { shallowMount, createLocalVue } from '@vue/test-utils'
import { clear, advanceTo } from 'jest-date-mock'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'
import { VPopover } from 'test/unit/stubs'

import CreditsV3 from '@/components/Admin/TeamList/CreditsV3.vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueJSModal, { dynamic: true })

const stubs = { VPopover }
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
      annotation_credits_used: 50
    })
  }
})

// component renders a date value which depends on the current date,
// so it needs to be stubbed out
const now = '2030-01-01T00:00:00Z'
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  advanceTo(now)
  store = createTestStore()
})

afterEach(clear)

it('matches snapshot', () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(CreditsV3, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders annotation credits correctly', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(CreditsV3, { localVue, propsData, store, stubs })
  expect(wrapper.find('.credits__info').text()).toEqual('190')
  await wrapper.setProps({
    team: {
      ...v7,
      customer_v3: {
        customer_subscription: {
          ...v7.customer_v3!.customer_subscription,
          annotation_credits_used: 0
        }
      }
    }
  })
  expect(wrapper.find('.credits__info').text()).toEqual('240')
})
