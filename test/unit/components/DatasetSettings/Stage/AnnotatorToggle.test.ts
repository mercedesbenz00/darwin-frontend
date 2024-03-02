import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildMembershipPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import AnnotatorToggle from '@/components/DatasetSettings/Stage/AnnotatorToggle.vue'
import { MembershipPayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: {
  member: MembershipPayload,
  selected?: boolean
}

const member = buildMembershipPayload({
  id: 1, user_id: 2, first_name: 'John', last_name: 'Smith'
})

beforeEach(() => {
  propsData = { member }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotatorToggle, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.selected = true
  const wrapper = shallowMount(AnnotatorToggle, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits click', async () => {
  const wrapper = shallowMount(AnnotatorToggle, { localVue, propsData })
  await emitRootStub(wrapper, 'toggle')
  expect(wrapper.emitted().select).toEqual([[{ id: 2, selected: true }]])
})
