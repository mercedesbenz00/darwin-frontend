import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'
import { buttonEvents } from 'test/unit/testHelpers'

import DatasetSharer from '@/components/Dataset/DatasetSharer.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { installCommonComponents } from '@/plugins/components'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)
installCommonComponents(localVue)

const stubs: Stubs = { VPopover }
let info: ReturnType<typeof buildBillingInfoPayload>

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({}),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_used: 111
    })
  })

  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', info)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: { team: { slug: 'foo' }, dataset: { public: true, slug: 'bar' } }
  })
  expect(wrapper).toMatchSnapshot()
})

it('calls action when clicking share toggle', async () => {
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: { team: { slug: 'foo' }, dataset: { public: true, slug: 'bar' } }
  })
  await wrapper.find('.dataset-sharer__share-button').vm.$emit('click', buttonEvents)

  await wrapper.find('.dataset-sharer__modal__share-toggle').trigger('click')
  expect(wrapper.emitted()['toggle-share']).toEqual([[]])
})

it('disable toggle button when freemium plan and not trialing ', async () => {
  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({
      stripe_subscription_status: StripeSubscriptionStatus.PastDue
    }),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_used: 111
    }),
    freemium: true
  })
  store.commit('billing/SET_BILLING_INFO', info)
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: { team: { slug: 'foo' }, dataset: { public: true, slug: 'bar' } }
  })
  await wrapper.find('.dataset-sharer__share-button').vm.$emit('click', buttonEvents)
  await expect(wrapper.find('.dataset-sharer__modal__share-toggle').attributes('disabled')).toBeTruthy()
})

it('renders toggle button differently depending on dataset status', async () => {
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: { team: { slug: 'foo' }, dataset: { public: true, slug: 'bar' } }
  })
  await wrapper.find('.dataset-sharer__share-button').vm.$emit('click', buttonEvents)
  expect(wrapper.find('.dataset-sharer__modal__share-toggle__control--active').exists()).toBe(true)

  await wrapper.setProps({ team: { slug: 'foo' }, dataset: { public: false, slug: 'bar' } })
  expect(wrapper.find('.dataset-sharer__modal__share-toggle__control--active').exists()).toBe(false)
})

it('renders share url if sharing is enabled', async () => {
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: { team: { slug: 'foo' }, dataset: { public: false, slug: 'bar' } }
  })

  await wrapper.find('.dataset-sharer__share-button').vm.$emit('click', buttonEvents)
  expect(wrapper.find('.dataset-sharer__modal__share-url').exists()).toBe(false)

  wrapper.setProps({ dataset: { public: true, slug: 'bar' } })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.dataset-sharer__modal__share-url').exists()).toBe(true)
})

test('renders share url', async () => {
  const wrapper = shallowMount(DatasetSharer, {
    localVue,
    store,
    stubs,
    propsData: {
      team: { slug: 'foo' },
      dataset: { public: true, slug: 'bar' }
    }
  })

  await wrapper.find('.dataset-sharer__share-button').vm.$emit('click', buttonEvents)
  expect(wrapper.find('.dataset-sharer__modal__share-url').text()).toContain('/foo/bar')

  wrapper.setProps({ team: { slug: 'foo-1' }, dataset: { slug: 'bar-baz', public: true } })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.dataset-sharer__modal__share-url').text()).toContain('/foo-1/bar-baz')
})
