import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import {
  ButtonModel,
  CheckBoxModel,
  InputFieldModel
} from 'test/unit/pageModels'

import UsageLimiter from '@/components/Plans/Product/Usage/UsageLimiter.vue'

const localVue = createLocalVue()

let propsData: {
  disabled?: boolean
  limit: number
  parentLimit: number
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get limitField (): InputFieldModel {
    return new InputFieldModel(this.wrapper.find('input-field-small-stub'))
  }

  get limitCheckbox () {
    return new CheckBoxModel(this.wrapper.find('check-box-stub'))
  }

  get saveButton () {
    return new ButtonModel(this.wrapper.find('mini-secondary-light-button-stub'))
  }

  // events

  get saveCalls () {
    return this.wrapper.emitted()['set-limit'] || []
  }

  get lastSaveCallValue () {
    return this.saveCalls[0] ? this.saveCalls[0][0] : null
  }

  get resetCalls () {
    return this.wrapper.emitted()['reset-limit'] || []
  }
}

describe('when usage is limited', () => {
  beforeEach(() => {
    propsData = { limit: 150, parentLimit: 200 }
  })

  itMatchesSnapshot()

  it('renders as limited', () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    expect(model.limitCheckbox.isChecked).toBe(true)
    expect(model.limitField.isDisabled).toBe(false)
    expect(model.saveButton.isDisabled).toBe(false)
  })

  it('allows resetting limit', async () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    await model.limitCheckbox.uncheck()
    expect(model.limitField.isDisabled).toBe(true)
    expect(model.resetCalls.length).toEqual(1)
  })

  it('allows changing limit', async () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    await model.limitField.set(100)
    await model.saveButton.click()
    expect(model.saveCalls.length).toEqual(1)
    expect(model.lastSaveCallValue).toEqual(100)
  })

  it('resets to unlimited when such props are received', async () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    await wrapper.setProps({ limit: 200, parentLimit: 200 })
    expect(model.limitCheckbox.isChecked).toBe(false)
    expect(model.limitField.isDisabled).toBe(true)
    expect(model.saveButton.isDisabled).toBe(true)
  })

  describe('when disabled', () => {
    beforeEach(() => {
      propsData.disabled = true
    })

    itMatchesSnapshot()

    it('renders as disabled', () => {
      const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
      const model = new Model(wrapper)

      expect(model.limitCheckbox.isDisabled).toBe(true)
      expect(model.limitField.isDisabled).toBe(true)
      expect(model.saveButton.isDisabled).toBe(true)
    })
  })
})

describe('when usage is not limited', () => {
  beforeEach(() => {
    propsData = { limit: 200, parentLimit: 200 }
  })

  itMatchesSnapshot()

  it('renders as not limited', () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    expect(model.limitCheckbox.isChecked).toBe(false)
    expect(model.limitField.isDisabled).toBe(true)
    expect(model.saveButton.isDisabled).toBe(true)
  })

  it('allows enabling and setting limit', async () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)

    await model.limitCheckbox.check()
    expect(model.limitField.isDisabled).toBe(false)

    await model.limitField.set(100)
    await model.saveButton.click()
    expect(model.saveCalls.length).toEqual(1)
    expect(model.lastSaveCallValue).toEqual(100)
  })

  it('resets to limited when such props are received', async () => {
    const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
    const model = new Model(wrapper)
    await wrapper.setProps({ limit: 150, parentLimit: 200 })
    expect(model.limitCheckbox.isChecked).toBe(true)
    expect(model.limitField.isDisabled).toBe(false)
    expect(model.saveButton.isDisabled).toBe(false)
  })

  describe('when disabled', () => {
    beforeEach(() => {
      propsData.disabled = true
    })

    itMatchesSnapshot()

    it('renders as disabled', () => {
      const wrapper = shallowMount(UsageLimiter, { localVue, propsData })
      const model = new Model(wrapper)

      expect(model.limitCheckbox.isDisabled).toBe(true)
      expect(model.limitField.isDisabled).toBe(true)
      expect(model.saveButton.isDisabled).toBe(true)
    })
  })
})
