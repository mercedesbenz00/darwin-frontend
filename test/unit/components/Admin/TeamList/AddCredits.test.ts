import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { clear, advanceTo } from 'jest-date-mock'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import AddCredits from '@/components/Admin/TeamList/AddCredits.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal, { dynamic: true })
localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const stubs = {
  'input-field': true,
  'text-area': true
}

const v7 = buildAdminTeamPayload({ name: 'V7' })

let store: ReturnType<typeof createTestStore>
let propsData: { team: ReturnType<typeof buildAdminTeamPayload> }
let mocks: { $modal: { show: Function, hide: Function } }

// component renders a date value which depends on the current date, so it needs to be stubbed out
const now = '2030-01-01T00:00:00Z'
beforeEach(() => {
  advanceTo(now)
  store = createTestStore()
  propsData = {
    team: v7
  }
  const show = jest.fn()
  const hide = jest.fn()
  mocks = { $modal: { show, hide } }
})

afterEach(clear)

it('matches snapshot', () => {
  const wrapper = shallowMount(AddCredits, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('creating credits', () => {
  const partial = (o: object) => expect.objectContaining(o)

  it('calls store action to create credit', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('admin/createCredit', {
      amountBilled: 1000 * 3600,
      team: v7,
      note: null,
      expiresAt: '2031-01-01T00:00:00.000Z'
    })
  })

  it('can create with selectable amount of 10000', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    await wrapper.findAll('.credit__amounts > *').at(1).vm.$emit('click')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(wrapper.find('input-field-stub').attributes('value')).toEqual('10000')
    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ amountBilled: 10000 * 3600 }))
  })

  it('can create with selectable amount of 1000', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    // click 1000, then submit again
    await wrapper.findAll('.credit__amounts > *').at(0).vm.$emit('click')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(wrapper.find('.credit__custom-amount').attributes('value')).toEqual('1000')
    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ amountBilled: 1000 * 3600 }))
  })

  it('can set custom amount', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    // enter custom value, then submit again
    await wrapper.find('.credit__custom-amount').vm.$emit('input', 900)
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ amountBilled: 900 * 3600 }))
  })

  it('can create with selectable expiry date of two weeks from now', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    await wrapper.findAll('.credit__dates > *').at(1).vm.$emit('click')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(wrapper.find('.credit__custom-date').attributes('value'))
      .toEqual('2030-01-15')

    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ expiresAt: '2030-01-15T00:00:00.000Z' }))
  })

  it('can create with selectable expiry date of one year from now', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    await wrapper.findAll('.credit__dates > *').at(0).vm.$emit('click')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(wrapper.find('.credit__custom-date').attributes('value'))
      .toEqual('2031-01-01')

    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ expiresAt: '2031-01-01T00:00:00.000Z' }))
  })

  it('can set custom expiry date', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    // enter custom value, then submit again
    await wrapper.find('.credit__custom-date').vm.$emit('input', '2050-01-01')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(store.dispatch)
      .toHaveBeenCalledWith('admin/createCredit', partial({ expiresAt: '2050-01-01T00:00:00.000Z' }))
  })

  it('sends different note param based on user input', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    await wrapper.find('text-area-stub').vm.$emit('input', 'Custom note')
    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    expect(store.dispatch).toHaveBeenCalledWith('admin/createCredit', partial({ note: 'Custom note' }))
  })

  it('shows errors if create call fails', async () => {
    const wrapper = shallowMount(AddCredits, { localVue, propsData, store, stubs })

    const validationError = {
      isValidationError: true, message: 'Validation error', amountBilled: 'Is wrong'
    }
    const dispatch = (store.dispatch as jest.Mock)
    dispatch.mockResolvedValue({ error: validationError })

    await wrapper.find('.modal__footer positive-button-stub').vm.$emit('click')
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Validation error' })
    expect(wrapper.find('input-field-stub').props('error')).toEqual('Is wrong')
  })
})

it('toggles modal on button click', async () => {
  const wrapper = shallowMount(AddCredits, { localVue, mocks, propsData, store, stubs })

  await wrapper.find('.credit__button').trigger('click')
  expect(mocks.$modal.show).toHaveBeenCalled()

  await wrapper.find('.modal__footer secondary-button-stub').vm.$emit('click')
  expect(mocks.$modal.hide).toHaveBeenCalled()
})
