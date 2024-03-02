import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { StageType } from '@/store/types/StageType'

import StatusButton from './StatusButton.vue'
import {
  StatusButtonProps,
  StatusButtonSize,
  StatusButtonVariant
} from './types'

const localVue = createLocalVue()
localVue.directive('tooltip', () => stubDirectiveWithAttribute)

let wrapper: Wrapper<Vue>

const propsData: StatusButtonProps = {
  type: StageType.Annotate,
  size: StatusButtonSize.SM,
  variant: StatusButtonVariant.DEFAULT
}

beforeEach(() => {
  wrapper = shallowMount(StatusButton, { localVue, propsData })
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  expect(wrapper.exists()).toBeTruthy()
})

it('should match snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

it('should apply the correct classes', () => {
  expect(wrapper.attributes().class.includes('status-button--size--sm')).toBe(true)
})

it('should match snapshot when type review', async () => {
  await wrapper.setProps({ ...propsData, type: StageType.Review })
  expect(wrapper).toMatchSnapshot()
})
