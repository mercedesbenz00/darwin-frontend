import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ProgressBar from '@/components/Common/ProgressBar/ProgressBar.vue'
import { ProgressBarProps, ProgressBarVariant } from '@/components/Common/ProgressBar/types'

let wrapper: Wrapper<Vue>

const propsData: ProgressBarProps = {
  value: 0.1,
  variant: ProgressBarVariant.ACTIVE
}

beforeEach(() => {
  wrapper = shallowMount(ProgressBar, { propsData })
})

afterEach(() => {
  wrapper.destroy()
})

describe('ProgressBar UI', () => {
  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should have correct width', async () => {
    const child = wrapper.find('.progress-indicator-value')
    expect(child.attributes().style).toContain('width: 10%;')

    await wrapper.setProps({ variant: ProgressBarVariant.ACTIVE, value: 0.5 })

    expect(child.attributes().style).toContain('width: 50%;')
  })

  it('should match class with variant', async () => {
    const child = wrapper.find('.progress-indicator-value')
    expect(child.attributes().class).toContain('progress-indicator-value--active')

    await wrapper.setProps({ variant: ProgressBarVariant.INACTIVE, value: 0.5 })

    expect(child.attributes().class).toContain('progress-indicator-value--inactive')
  })
})
