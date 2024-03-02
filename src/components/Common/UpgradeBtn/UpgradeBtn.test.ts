import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import PortalVue from 'portal-vue'
import VTooltip from 'v-tooltip'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import { UpgradeBtn } from '@/components/Common/UpgradeBtn'
import { SubscriptionPlanName } from '@/components/Plans/Product/utils'
import { installCommonComponents } from '@/plugins/components'
import { ProductType } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
localVue.use(PortalVue)
localVue.use(VTooltip)
localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const v7 = buildTeamPayload({
  name: 'V7',
  inserted_at: '2000-01-01T00:00:00'
})

const model = {
  upgradeButton: '.upgrade-button',
  upgradeTfaIconStub: 'upgrade-tfa-icon-stub',
  editPlanModal: 'edit-plan-modal-stub'
}

const buttonEventMock = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
}

let info: ReturnType<typeof buildBillingInfoPayload>

let store: ReturnType<typeof createTestStore>
let mocks: {
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}
let propsData: {
  to: SubscriptionPlanName
}

beforeEach(() => {
  mocks = {
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({}),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_used: 111
    })
  })
  propsData = { to: 'enterprise' }

  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', info)
  store.commit('team/SET_CURRENT_TEAM', v7)
})

const itMatchesSnapshot = (): void => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(UpgradeBtn, { localVue, mocks, store, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when team is not target plan', () => {
  itMatchesSnapshot()

  it('shows upgrade buttion icon', async () => {
    const wrapper = shallowMount(UpgradeBtn, { localVue, mocks, store, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper.find(model.upgradeButton).exists).toBeTruthy()
  })

  it('opens edit plan modal and submits new amount', async () => {
    const wrapper = shallowMount(UpgradeBtn, { localVue, store, mocks, propsData })
    await wrapper.find(model.upgradeTfaIconStub).vm.$emit('click', buttonEventMock)
    expect(mocks.$modal.show).toBeCalledWith(ProductType.AnnotationCredits)
    await wrapper.find(model.editPlanModal).vm.$emit('submit', 100)

    await flushPromises()
    expect(store.dispatch).not.toBeCalledWith('team/getTeam', v7.id)
  })
})

describe('when team is target plan', () => {
  beforeEach(() => {
    info.customer_subscription!.annotation_credits_standard = 3500
    info.customer_subscription!.annotation_credits_standard_max_in_period = 3500

    store.commit('billing/SET_BILLING_INFO', info)
  })

  itMatchesSnapshot()
})
