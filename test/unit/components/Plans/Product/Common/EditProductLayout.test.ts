import { createLocalVue, shallowMount } from '@vue/test-utils'

import EditProductLayout from '@/components/Plans/Product/Common/EditProductLayout.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)

const slots = {
  title: 'Title',
  current: 'Current',
  new: 'New',
  extra: 'Extra'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(EditProductLayout, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with issues given', () => {
  const wrapper = shallowMount(EditProductLayout, {
    localVue, slots: { ...slots, issues: 'Issues' }
  })

  expect(wrapper.text()).toMatchSnapshot()
})

it('matches snapshot when confirm disabled', () => {
  const propsData = { confirmDisabled: true }
  const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('renders slots', () => {
  const wrapper = shallowMount(EditProductLayout, { localVue, slots })
  expect(wrapper.text()).toContain('Title')
  expect(wrapper.text()).toContain('Current')
  expect(wrapper.text()).toContain('New')
  expect(wrapper.text()).toContain('Extra')
})

it('renders #issues slot if given', () => {
  const wrapper = shallowMount(EditProductLayout, {
    localVue, slots: { ...slots, issues: 'Issues' }
  })

  expect(wrapper.text()).toContain('Issues')
})

it('emits cancel', async () => {
  const wrapper = shallowMount(EditProductLayout, { localVue, slots })
  await wrapper.find('secondary-button-stub.edit-product__footer__button--cancel').vm.$emit('click')
  expect(wrapper.emitted().cancel).toHaveLength(1)
})

it('emits confirm', async () => {
  const wrapper = shallowMount(EditProductLayout, { localVue, slots })
  await wrapper.find('positive-button-stub.edit-product__footer__button--confirm').vm.$emit('click')
  expect(wrapper.emitted().confirm).toHaveLength(1)
})

describe('when disabled', () => {
  const propsData = { disabled: true }

  it('matches snapshot', () => {
    const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when title slot is missing', () => {
    const newSlots = {
      current: 'Current',
      new: 'New',
      extra: 'Extra'
    }
    const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots: newSlots })
    expect(wrapper).toMatchSnapshot()
  })

  it('disables buttons', () => {
    const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots })
    expect(wrapper.find('secondary-button-stub.edit-product__footer__button--cancel').attributes('disabled')).toBe('true')
    expect(wrapper.find('positive-button-stub.edit-product__footer__button--confirm').attributes('disabled')).toBe('true')
  })

  it('does not emit cancel', () => {
    const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots })
    expect(wrapper.find('positive-button-stub.edit-product__footer__button--confirm').attributes('disabled')).toBe('true')
  })

  it('does not emit confirm', () => {
    const wrapper = shallowMount(EditProductLayout, { localVue, propsData, slots })
    expect(wrapper.find('positive-button-stub.edit-product__footer__button--confirm').attributes('disabled')).toBe('true')
  })
})
