import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import { buildV2WorkflowStagePayload } from 'test/unit/factories'

import { StageType } from '@/store/types'
import { V2WebhookStagePayload } from '@/store/types/V2WorkflowStagePayload'

import WebhookStageChild from './WebhookStageChild.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VTooltip, { defaultHtml: true })

const blankStage = buildV2WorkflowStagePayload({
  type: StageType.Webhook,
  config: {
    url: ''
  }
}) as V2WebhookStagePayload

const filledStage = buildV2WorkflowStagePayload({
  type: StageType.Webhook,
  config: {
    url: 'https://domain.com'
  }
}) as V2WebhookStagePayload

const propsData = { scale: 1, stage: blankStage }

let wrapper: Wrapper<Vue>

afterEach(() => {
  wrapper.destroy()
})

describe('when the url is not set', () => {
  beforeEach(() => {
    wrapper = shallowMount(WebhookStageChild, { localVue, propsData })
  })

  it('matches snapshots and shows a set url button', () => {
    const noUrlWrapper = wrapper.find('.webhook__content__no-url')
    expect(noUrlWrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when the url is set', () => {
  beforeEach(() => {
    wrapper = shallowMount(WebhookStageChild, { localVue, propsData })
  })

  it('matches snapshots and shows the recap of the url', async () => {
    await wrapper.setProps({ stage: filledStage })

    const urlWrapper = wrapper.find('.webhook__content__url')
    const urlWrapperLabel = urlWrapper.find('.webhook__content__url__label')
    expect(urlWrapper.exists()).toBeTruthy()
    expect(urlWrapperLabel.text()).toBe('https://domain.com')
    expect(wrapper).toMatchSnapshot()
  })
})
