import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import SecondsPerAutomationAction from '@/components/Admin/TeamDetails/SecondsPerAutomationAction.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const v7 = buildAdminTeamPayload({
  name: 'V7',
  customer_v3: {
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 40,
      annotation_credits_standard: 100,
      annotation_credits_used: 50,
      seconds_per_automation_action: 22
    })
  }
})

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(SecondsPerAutomationAction, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot('normal')

  await wrapper.find('secondary-button-stub').vm.$emit('click')
  expect(wrapper).toMatchSnapshot('editing')
})

it('renders seconds_per_automation_action', () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(SecondsPerAutomationAction, { localVue, propsData, store })
  expect(wrapper.text()).toContain('22')
})

it('supports updating seconds_per_automation_action', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(SecondsPerAutomationAction, { localVue, propsData, store })

  await wrapper.find('secondary-button-stub').vm.$emit('click')
  await wrapper.find('input-field-stub').vm.$emit('input', 28)

  await wrapper.find('positive-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('admin/updateCustomerSubscription', {
    team: v7,
    seconds_per_automation_action: 28
  })
  expect(wrapper.find('input-field').exists()).toBe(false)
})

it('renders validation errors on update fail', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(SecondsPerAutomationAction, { localVue, propsData, store })

  await wrapper.find('secondary-button-stub').vm.$emit('click')
  await wrapper.find('input-field-stub').vm.$emit('change', 28)

  const error = {
    isValidationError: true,
    seconds_per_automation_action: 'Is required'
  }
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error })
  await wrapper.find('positive-button-stub').vm.$emit('click')
  await flushPromises()
  expect(wrapper.find('input-field-stub').exists()).toBe(true)
  expect(wrapper.find('input-field-stub').props('error'))
    .toEqual(error.seconds_per_automation_action)
})
