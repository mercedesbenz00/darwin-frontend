import { createLocalVue, shallowMount } from '@vue/test-utils'

import LoginTfaForm from '@/components/Auth/TwoFactorAuthentication/LoginTfaForm.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)
let propsData: {
  showError: boolean
}

beforeEach(() => {
  propsData = { showError: false }
})

const models = {
  confirmButton: '.login-tfa-form__confirm',
  nthNumberCell: (index: number) => `login-tfa-number-cell-stub:nth-child(${index})`
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(LoginTfaForm, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when initial state', () => {
  itMatchesSnapshot()
})

describe('when errored', () => {
  itMatchesSnapshot()
})

describe('keydown events', () => {
  it('updates the ui', async () => {
    const wrapper = shallowMount(LoginTfaForm, { localVue, propsData })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(1)).props('value')).toEqual(1)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(2)).props('value')).toEqual(2)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(3)).props('value')).toEqual(3)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '4' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(4)).props('value')).toEqual(4)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(5)).props('value')).toEqual(5)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(5)).props('value')).toEqual(null)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '6' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(5)).props('value')).toEqual(6)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find(models.nthNumberCell(6)).props('value')).toEqual(7)

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().confirm).toEqual([[]])
    expect(wrapper).toMatchSnapshot()
  })
})
