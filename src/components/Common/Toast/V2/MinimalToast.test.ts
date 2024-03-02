import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import MinimalToast from '@/components/Common/Toast/V2/MinimalToast.vue'
import { ToastEvent, ToastProps } from '@/components/Common/Toast/V2/types'

let wrapper: Wrapper<Vue>
let propsData: ToastProps

beforeEach(() => {
  propsData = {
    variant: ToastEvent.SUCCESS,
    meta: {
      title: 'Test Title',
      desc: 'Test description'
    }
  }

  wrapper = shallowMount(MinimalToast, {
    propsData
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Minimal Toast UI', () => {
  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render labels', () => {
    const label = wrapper.find('.minimal-toast-status__label')

    expect(label.text()).toEqual('Test Title')
  })

  it('should render proper colors', () => {
    expect(wrapper.find('.minimal-toast-status__label--success').exists()).toBeTruthy()
  })
})
