import { createLocalVue, mount, Wrapper } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { StageActionType } from '@/store/types'

import ContinueButton from './ContinueButton.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

type PropsDataType = {
  type: StageActionType,
  completesAt: number | null,
  waiting: boolean
}

const itMatchesSnaphsot = (propsData: PropsDataType): void => it('matches snapshot', () => {
  const wrapper = mount(ContinueButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when type is Archive', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {
    type: StageActionType.Archive,
    completesAt: null,
    waiting: false
  }

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(ContinueButton, {
      localVue,
      propsData: _propsData
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should have correct text', () => {
    const button = wrapper.find('.continue__button')
    expect(button.text()).toBe('Send to Archive')
  })

  it('should not render timer', () => {
    expect(wrapper.find('.timer').exists()).toBe(false)
  })

  it('should not be able to restart', () => {
    expect((wrapper.vm as any).canRestart).toBe(false)
  })
})

describe('when completesAt is set', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {
    type: StageActionType.Archive,
    completesAt: 1645095818,
    waiting: true
  }

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(ContinueButton, {
      localVue,
      propsData: _propsData
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should have correct text', () => {
    const button = wrapper.find('.continue__button')
    expect(button.text()).toBe('Cancel')
  })

  it('should render timer', () => {
    expect(wrapper.find('.timer').exists()).toBe(true)
  })

  it('should not be able to restart', () => {
    expect((wrapper.vm as any).canRestart).toBe(false)
  })
})

describe('when waiting is true', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {
    type: StageActionType.Archive,
    completesAt: null,
    waiting: true
  }

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(ContinueButton, {
      localVue,
      propsData: _propsData
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should have correct text', () => {
    const button = wrapper.find('.continue__button')
    expect(button.text()).toBe('Waiting for others')
  })

  it('should not render timer', () => {
    expect(wrapper.find('.timer').exists()).toBe(false)
  })

  it('should not be able to restart', () => {
    expect((wrapper.vm as any).canRestart).toBe(false)
  })
})

describe('when stage is completed', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {
    type: StageActionType.Completed,
    completesAt: null,
    waiting: false
  }

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(ContinueButton, {
      localVue,
      propsData: _propsData
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should have correct text', () => {
    const button = wrapper.find('.continue__button')
    expect(button.text()).toBe('Restart Workflow')
  })

  it('should not render timer', () => {
    expect(wrapper.find('.timer').exists()).toBe(false)
  })

  it('should not be able to restart', () => {
    expect((wrapper.vm as any).canRestart).toBe(true)
  })
})
