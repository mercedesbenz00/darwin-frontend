import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildBillingInfoPayload,
  buildCreditUsagePayload,
  buildCreditUsagePayloadV2,
  buildCustomerPayload,
  buildTeamPayload
} from 'test/unit/factories'

import CreditSummary from '@/components/Plans/Product/Usage/CreditSummary.vue'
import { TeamPayload } from '@/store/types'

const v7 = buildTeamPayload({ id: 7, name: 'V7' })

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

class Model {
  wrapper: any

  constructor (wrapper: any) {
    this.wrapper = wrapper
  }

  get mainSection (): Wrapper<Vue> {
    return this.wrapper.findAll('credit-summary-item-stub').at(0)
  }

  get clientSections (): Wrapper<Vue>[] {
    return this.wrapper
      .findAll('credit-summary-item-stub')
      .wrappers
      .filter((w: never, index: number) => index > 0)
  }
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(CreditSummary, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('billing/SET_BILLING_INFO', buildBillingInfoPayload({}))
})

describe('when no usage yet loaded', () => {
  itMatchesSnapshot()
})

describe('when team is regular', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('billing/SET_CREDIT_USAGE', buildCreditUsagePayload())
  })

  itMatchesSnapshot()
})

describe('when team is partner', () => {
  let partner: TeamPayload

  beforeEach(() => {
    partner = buildTeamPayload({
      id: 1,
      name: 'A partner',
      clients: [
        buildTeamPayload({ id: 11, name: 'Client 1' }),
        buildTeamPayload({ id: 12, name: 'Client 2' })
      ]
    })

    const partnerInfo = buildBillingInfoPayload({
      clients: [
        buildBillingInfoPayload({ customer: buildCustomerPayload({ team_id: 11 }) }),
        buildBillingInfoPayload({ customer: buildCustomerPayload({ team_id: 12 }) })
      ]
    })

    const partnerUsage = buildCreditUsagePayload({
      team_id: 1,
      clients: [
        buildCreditUsagePayload({ team_id: 11 }),
        buildCreditUsagePayload({ team_id: 12 })
      ]
    })

    store.commit('team/SET_CURRENT_TEAM', partner)
    store.commit('billing/SET_BILLING_INFO', partnerInfo)
    store.commit('billing/SET_CREDIT_USAGE', partnerUsage)
  })

  itMatchesSnapshot()

  it('renders summary item for partner and every client team', () => {
    const wrapper = shallowMount(CreditSummary, { localVue, store })
    const model = new Model(wrapper)

    expect(model.mainSection.exists()).toBe(true)
    expect(model.clientSections.length).toEqual(2)
  })
})

describe('when team is client', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', { ...v7, managed_status: 'client' })
    store.commit('billing/SET_CREDIT_USAGE', buildCreditUsagePayload())
  })

  itMatchesSnapshot()
})

describe('when Workflows 2.0', () => {
  beforeEach(() => {
    const feature1 = { name: 'TICKER_UI', enabled: true }
    store.commit('features/SET_FEATURES', [feature1])
    store.commit('team/SET_CURRENT_TEAM', { ...v7, managed_status: 'client' })
    store.commit('billing/SET_CREDIT_USAGE_V2', buildCreditUsagePayloadV2())
  })

  itMatchesSnapshot()
})
