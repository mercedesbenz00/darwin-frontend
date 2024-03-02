import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAdminTeamPayload } from 'test/unit/factories'

import TeamDetails from '@/components/Admin/TeamDetails/TeamDetails.vue'
import TeamSection from '@/components/Admin/TeamDetails/TeamSection.vue'
import TeamSectionField from '@/components/Admin/TeamDetails/TeamSectionField.vue'
import { installCommonComponents } from '@/plugins/components'
import { StripeSubscriptionStatus } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: { team: ReturnType<typeof buildAdminTeamPayload> }

const stubs = { TeamSection, TeamSectionField }

beforeEach(() => {
  store = createTestStore()
  propsData = {
    team: buildAdminTeamPayload({
      creation_date: '2010-05-01T12:05:55',
      credit_next_expiry: '2040-05-01T14:22:33',
      dataset_count: 5,
      id: 1,
      name: 'V7',
      note: 'Asked for extra credits',
      owner_email: 'joe@v7test.com',
      owner_first_name: 'Joe',
      owner_last_name: 'Owner',
      slug: 'v7',
      stripe_id: 'cus12345678',
      subscription_id: 'sub12345678',
      subscription_period_end: 2524608000,
      subscription_period_start: 2524708000,
      subscription_status: StripeSubscriptionStatus.Cancelled,
      user_count: 10
    })
  }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(TeamDetails, { localVue, propsData, store, stubs })
  await flushPromises()

  expect(wrapper).toMatchSnapshot()
})

it('dispatches action to enable MODEL_STAGE on click', async () => {
  const wrapper = shallowMount(TeamDetails, { localVue, propsData, store, stubs })
  await flushPromises()

  const button = wrapper
    .findAll('primary-button-stub').wrappers
    .find(b => b.text() === 'Enable AI Stages')

  expect(button).toBeTruthy()
  await button!.vm.$emit('click')

  expect(store.dispatch).toHaveBeenCalledWith('admin/createTeamFeature', {
    feature: 'MODEL_STAGE',
    teamId: propsData.team.id
  })
})

it('dispatches action to enable CODE_STAGE on click', async () => {
  const wrapper = shallowMount(TeamDetails, { localVue, propsData, store, stubs })
  await flushPromises()

  const button = wrapper
    .findAll('primary-button-stub').wrappers
    .find(b => b.text() === 'Enable Code Stages')

  expect(button).toBeTruthy()
  await button!.vm.$emit('click')

  expect(store.dispatch).toHaveBeenCalledWith('admin/createTeamFeature', {
    feature: 'CODE_STAGE',
    teamId: propsData.team.id
  })
})

it('dispatches action to enable BLIND_STAGE on click', async () => {
  const wrapper = shallowMount(TeamDetails, { localVue, propsData, store, stubs })
  await flushPromises()

  const button = wrapper
    .findAll('primary-button-stub').wrappers
    .find(b => b.text() === 'Enable Blind Stages')

  expect(button).toBeTruthy()
  await button!.vm.$emit('click')

  expect(store.dispatch).toHaveBeenCalledWith('admin/createTeamFeature', {
    feature: 'BLIND_STAGE',
    teamId: propsData.team.id
  })
})
