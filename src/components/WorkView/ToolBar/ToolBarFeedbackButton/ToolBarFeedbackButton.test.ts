import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildBillingInfoPayload } from 'test/unit/factories'

import ToolBarFeedbackButton from '@/components/WorkView/ToolBar/ToolBarFeedbackButton/ToolBarFeedbackButton.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const $theme = {
  getCurrentScale: (): number => 1
}
let mocks: {
  $intercom: { visible: boolean }
  $theme: {
    getCurrentScale (): number
  }
}
let store: ReturnType<typeof createTestStore>
let info: ReturnType<typeof buildBillingInfoPayload>

beforeEach(() => {
  mocks = {
    $intercom: { visible: false },
    $theme
  }
  store = createTestStore()
  info = buildBillingInfoPayload({})
  store.commit('billing/SET_BILLING_INFO', info)
})

describe('matches snapshot', () => {
  it('intercom is hidden', () => {
    const wrapper = shallowMount(ToolBarFeedbackButton, { localVue, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })

  it('intercom is visible', () => {
    mocks.$intercom.visible = true
    const wrapper = shallowMount(ToolBarFeedbackButton, { localVue, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })
})

it('displays "Support / Feedback" for none-freemium teams', () => {
  const wrapper = shallowMount(ToolBarFeedbackButton, { localVue, store, mocks })
  expect(wrapper.find('.feedback__button').attributes('tooltip'))
    .toContain("'content':'Support / Feedback'")
})

it('displays "Community Support" for freemium teams', () => {
  store.commit('billing/SET_BILLING_INFO', { ...info, freemium: true })
  const wrapper = shallowMount(ToolBarFeedbackButton, { localVue, store, mocks })
  expect(wrapper.find('.feedback__button').attributes('tooltip'))
    .toContain("'content':'Community Support'")
})
