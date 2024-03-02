import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildBillingInfoPayload } from 'test/unit/factories'
import { FeatureGuard, SettingsPane } from 'test/unit/stubs'
import { buttonEvents } from 'test/unit/testHelpers'

import Plans from '@/layouts/Main/SettingsDialog/Panes/Plans.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let mocks: { $can: (ability?: string) => boolean }

const stubs: Stubs = {
  FeatureGuard,
  SettingsPane
}

beforeEach(() => {
  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', buildBillingInfoPayload({}))
  mocks = { $can: () => true }
})

const setAllLoaded = async (wrapper: Wrapper<Vue>) => {
  await wrapper.setData(({ billingInfoLoading: false, invoicesLoading: false }))
}

describe('when user can manage billing', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
    setAllLoaded(wrapper)

    expect(wrapper).toMatchSnapshot()
  })

  it('render all tabs', () => {
    const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
    setAllLoaded(wrapper)
    expect(wrapper.findAll('.plans__tabs__tab').length).toEqual(2)
  })

  it('loads countries, billing info and invoices', () => {
    shallowMount(Plans, { localVue, mocks, store, stubs })
    expect(store.dispatch).toHaveBeenCalledWith('billing/loadCountries')
    expect(store.dispatch).toHaveBeenCalledWith('billing/loadBillingInfo')
    expect(store.dispatch).toHaveBeenCalledWith('billing/loadInvoices')
  })
})

describe('when user can only view billing', () => {
  beforeEach(() => {
    mocks.$can = () => false
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
    setAllLoaded(wrapper)
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render billing tab', () => {
    const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
    setAllLoaded(wrapper)
    expect(wrapper.findAll('.plans__tabs__tab').length).toEqual(1)
  })

  it('loads countries and billing info', () => {
    shallowMount(Plans, { localVue, mocks, store, stubs })
    expect(store.dispatch).toHaveBeenCalledWith('billing/loadCountries')
    expect(store.dispatch).toHaveBeenCalledWith('billing/loadBillingInfo')
    expect(store.dispatch).not.toHaveBeenCalledWith('billing/loadInvoices')
  })
})

it('switches tabs', async () => {
  const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
  await setAllLoaded(wrapper)

  const usageTab = wrapper.findAll('.plans__tabs__tab').at(0)
  const billingTab = wrapper.findAll('.plans__tabs__tab').at(1)

  expect(wrapper).toMatchSnapshot('usage-tab-by-default')

  await billingTab.vm.$emit('click', buttonEvents)
  expect(wrapper).toMatchSnapshot('billing-tab')

  await usageTab.vm.$emit('click', buttonEvents)
  expect(wrapper).toMatchSnapshot('usage-tab')
})

it('switches tab to billing on billing info missing', async () => {
  const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
  await setAllLoaded(wrapper)

  await wrapper.find('products-v3-stub').vm.$emit('billing-error', 'BILLING_ADDRESS_INFO_MISSING')
  expect(wrapper.vm.$data.currentTab).toEqual('billing')
})

it('switches tab to billing on payment not setup', async () => {
  const wrapper = shallowMount(Plans, { localVue, mocks, store, stubs })
  await setAllLoaded(wrapper)

  await wrapper.find('products-v3-stub').vm.$emit('billing-error', 'PAYMENT_NOT_SETUP')
  expect(wrapper.vm.$data.currentTab).toEqual('billing')
})
