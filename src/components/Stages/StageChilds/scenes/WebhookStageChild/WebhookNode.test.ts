import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildV2WorkflowStagePayload } from 'test/unit/factories'

import { StageType } from '@/store/types'
import { V2WebhookStagePayload } from '@/store/types/V2WorkflowStagePayload'

import WebhookNode from './WebhookNode.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const propsData = {
  scale: 1,
  stage: buildV2WorkflowStagePayload({ type: StageType.Webhook }) as V2WebhookStagePayload,
  variant: 'succeeded'
}

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(WebhookNode, { localVue, propsData })
})

it('matches snapshots when variant is succeeded', async () => {
  await wrapper.setProps({ variant: 'succeeded' })

  const label = wrapper.find('.node__wrapper__label')
  expect(label.text()).toBe('succeeded')
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshots when variant is failed', async () => {
  await wrapper.setProps({ variant: 'failed' })

  const label = wrapper.find('.node__wrapper__label')
  expect(label.text()).toBe('failed')
  expect(wrapper).toMatchSnapshot()
})
