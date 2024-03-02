import { createLocalVue, mount, Wrapper } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import clickOutsideDirective from '@/directives/click-outside'
import { SkippedReason } from '@/store/types'

import DiscardButton from './DiscardButton.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('click-outside', clickOutsideDirective)

type PropsDataType = {
  skippedReason?: SkippedReason
}

const DropdownIcon = { template: '<svg />' }

const itMatchesSnaphsot = (propsData: PropsDataType): void => it('matches snapshot', () => {
  const wrapper = mount(DiscardButton, {
    localVue,
    propsData,
    stubs: { DropdownIcon }
  })
  expect(wrapper).toMatchSnapshot()
})

describe('when no skipped reason is passed', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {}

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(DiscardButton, {
      localVue,
      propsData: _propsData,
      stubs: { DropdownIcon }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('opens dropdown on click', async () => {
    await wrapper.setData({ open: true })
    const menu = wrapper.find('.popup-menu-discard-button')
    expect(menu.findAll('.list-element').length).toBe(6)
  })

  it('closes on click-outside', async () => {
    document.body.click()
    await wrapper.vm.$nextTick()
    const menu = wrapper.find('.popup-menu-discard-button')
    expect(menu.exists()).toBe(false)
  })

  it('emits event after selecting the skip reason', async () => {
    await wrapper.setData({ open: true })
    const menu = wrapper.find('.popup-menu-discard-button')
    const firstListElement = menu.findAll('.list-element').at(0)
    firstListElement.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted()['toggle-skip']).toEqual([['Motion Blur']])
  })
})

describe('when a skipped reason is passed', () => {
  let wrapper: Wrapper<Vue>
  const _propsData: PropsDataType = {
    skippedReason: 'Motion Blur'
  }

  itMatchesSnaphsot(_propsData)

  beforeEach(() => {
    wrapper = mount(DiscardButton, {
      localVue,
      propsData: _propsData,
      stubs: { DropdownIcon }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('matches snapshot on open dropdown', async () => {
    const button = wrapper.find('.custom-button')
    await button.vm.$emit('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when submitting using arrow keys', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    const propsData: PropsDataType = {
      skippedReason: 'Motion Blur'
    }
    wrapper = mount(DiscardButton, { localVue, propsData, stubs: { DropdownIcon } })
  })

  it('select the next value open and hitting ARROW DOWN', async () => {
    await wrapper.setData({ open: true })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(1)
  })

  it('do not select the next value closed and hitting ARROW UP', async () => {
    await wrapper.setData({ open: false })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
  })

  it('select the prev value open and hitting ARROW UP', async () => {
    await wrapper.setData({ open: true })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(5)
  })

  it('do not select the prev value closed and hitting ARROW UP', async () => {
    await wrapper.setData({ open: false })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
  })

  it('submit the selected value when open and hitting ENTER', async () => {
    await wrapper.setData({ open: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()['toggle-skip']).toEqual([['Motion Blur']])
  })

  it('not submit the selected value when closed and hitting ENTER', async () => {
    await wrapper.setData({ open: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()['toggle-skip']).not.toBeDefined()
  })
})
