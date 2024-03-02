import { createLocalVue, shallowMount } from '@vue/test-utils'

import LoginTfaNumberCell from '@/components/Auth/TwoFactorAuthentication/LoginTfaNumberCell.vue'

const localVue = createLocalVue()
let propsData: {
  value: number | null
  active: boolean
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(LoginTfaNumberCell, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when value is null and active', () => {
  beforeEach(() => {
    propsData = {
      value: null,
      active: false
    }
  })

  itMatchesSnapshot()
})

describe('when value is defined', () => {
  beforeEach(() => {
    propsData = {
      value: 1,
      active: true
    }
  })

  itMatchesSnapshot()
})

describe('when active', () => {
  beforeEach(() => {
    propsData = {
      value: 1,
      active: false
    }
  })

  it('should focus on the component', async () => {
    const wrapper = shallowMount(LoginTfaNumberCell, { localVue, propsData })
    const inputRef = (wrapper.vm.$refs.inputRef as any)
    inputRef.focus = jest.fn()

    await wrapper.setProps({
      ...propsData,
      active: true
    })

    expect(inputRef.focus).toHaveBeenCalled()
  })
})
