import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ExtendedToast from '@/components/Common/Toast/V2/ExtendedToast.vue'
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

  wrapper = shallowMount(ExtendedToast, {
    propsData
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Extended Toast UI', () => {
  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render labels', () => {
    const wrappers = wrapper.findAll('.extended-toast__label')

    expect(wrappers.at(0).text()).toEqual('Test Title')
    expect(wrappers.at(1).text()).toEqual('Test description')
  })

  it('should render proper colors', () => {
    expect(wrapper.find('.extended-toast__label--success').exists()).toBeTruthy()
  })
})
