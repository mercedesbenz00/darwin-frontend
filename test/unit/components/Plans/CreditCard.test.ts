import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import CreditCard from '@/components/Plans/CreditCard.vue'
import { installCommonComponents } from '@/plugins/components'
import * as stripeUtils from '@/utils/stripe'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

jest.mock('@/utils/stripe', () => ({ stripe: jest.fn() }))

class StripeMock {
  mount: jest.Mock
  unmount: jest.Mock
  on: jest.Mock
  create: jest.Mock
  elements: jest.Mock

  changeCallback: null | Function = null

  constructor () {
    this.mount = jest.fn()
    this.unmount = jest.fn()
    this.on = jest.fn().mockImplementation((event, callback) => {
      this.changeCallback = callback
    })
    this.create = jest.fn().mockReturnValue({
      mount: this.mount,
      unmount: this.unmount,
      on: this.on
    })
    this.elements = jest.fn().mockReturnValue({ create: this.create })
  }
}

let stripeMock: StripeMock

beforeEach(() => {
  store = createTestStore()

  stripeMock = new StripeMock()
  jest.spyOn(stripeUtils, 'stripe').mockReturnValue({
    createToken: jest.fn(),
    elements: stripeMock.elements
  })
})

class Model {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get rendersStripeContainer (): boolean {
    return this.wrapper.find('#card-element').exists()
  }

  enterEditMode () {
    return this.wrapper.find('positive-button-stub.credit-card__button').vm.$emit('click')
  }

  cancelEditing () {
    return this.wrapper.find('secondary-button-stub.credit-card__button').vm.$emit('click')
  }

  submitCard () {
    return this.wrapper.find('positive-button-stub.credit-card__button').vm.$emit('click')
  }

  get errorText () {
    return this.wrapper.find('.credit-card__error').text()
  }

  spyOnStripeSetup () {
    return jest.spyOn(this.wrapper.vm as any, 'setupStripe')
  }
}

it('matches snapshot', () => {
  const wrapper = shallowMount(CreditCard, { localVue, store })
  expect(wrapper.element).toMatchSnapshot()
})

describe('read mode', () => {
  it('can switch to edit mode', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    expect(model.rendersStripeContainer).toBe(false)

    await model.enterEditMode()

    expect(model.rendersStripeContainer).toBe(true)
  })

  it('inits stripe on switch to edit mode', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)
    expect(model.rendersStripeContainer).toBe(false)

    const initSpy = model.spyOnStripeSetup()

    await model.enterEditMode()

    expect(initSpy).toHaveBeenCalled()
  })
})

describe('edit mode', () => {
  it('calls store action on save', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.submitCard()

    expect(store.dispatch).toHaveBeenCalledWith('billing/updateCard', { card: expect.anything() })
  })

  it('clears card status on save', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.submitCard()

    expect(store.state.billing.cardStatus).toEqual(null)
  })

  it('can cancel', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.cancelEditing()

    expect(store.dispatch).not.toHaveBeenCalledWith('billing/updateCard', expect.anything())
  })

  it('clears card status on cancel', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.cancelEditing()

    expect(store.state.billing.cardStatus).toEqual(null)
  })

  it('dispatches toast on save error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.submitCard()
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it('renders card error returned from backend', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      error: { message: 'Fake error', isValidationError: true, card: 'Invalid CVC' }
    })

    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)

    await model.enterEditMode()
    await model.submitCard()

    await flushPromises()

    expect(model.errorText).toEqual('Invalid CVC')
  })
})

describe('on entering edit moode', () => {
  it('mounts card', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)
    await model.enterEditMode()

    expect(stripeMock.elements).toHaveBeenCalled()
    expect(stripeMock.create).toHaveBeenCalledWith('card', expect.anything())
    expect(stripeMock.mount).toHaveBeenCalledWith('#card-element')
    expect(stripeMock.on).toHaveBeenCalledWith('change', expect.anything())
  })

  it('sets correct card status if error on "change"', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)
    await model.enterEditMode()

    stripeMock.changeCallback!({ error: { message: 'Test error message' } })
    expect(store.state.billing.cardStatus).toEqual({ complete: false, error: 'Test error message' })
  })

  it('sets correct card status if complete on "change"', async () => {
    const wrapper = shallowMount(CreditCard, { localVue, store })
    const model = new Model(wrapper)
    await model.enterEditMode()

    stripeMock.changeCallback!({ complete: true })
    expect(store.state.billing.cardStatus).toEqual({ complete: true, error: null })
  })
})
