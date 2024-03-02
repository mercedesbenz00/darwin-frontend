import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { ChevronPagination } from '@/components/WorkView/Pagination'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('input-auto-blur', stubDirectiveWithAttribute)
let propsData: {
  page: number
  pageCount: number
  prev: string
  next: string
}

let mocks: {
  $featureEnabled: () => boolean
}

beforeEach(() => {
  propsData = {
    page: 1,
    pageCount: 10,
    prev: 'Prev (<)',
    next: 'Next (>)'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('should exist', () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  expect(wrapper.exists()).toBeTruthy()
})

it("shouldn't exist if pageCount equals 0", async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  await wrapper.setProps({ pageCount: 0 })
  const pagination = wrapper.find('pagination')
  expect(pagination.exists()).toBeFalsy()
})

it('updates current page as prop changes', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  expect((wrapper.find('input').element as HTMLInputElement).value).toEqual('1')
  wrapper.setProps({ ...propsData, page: 2 })
  await wrapper.vm.$nextTick()
  expect((wrapper.find('input').element as HTMLInputElement).value).toEqual('2')
})

it('updates total page pages as prop changes', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  expect(wrapper.text()).toEqual('/ 10')
  wrapper.setProps({ ...propsData, pageCount: 15 })
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toEqual('/ 15')
})

it('emits events when clicking left and right arrows', async () => {
  propsData.page = 2
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const prev = wrapper.find('.pagination__button__prev')
  const next = wrapper.find('.pagination__button__next')
  prev.vm.$emit('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(1)
  next.vm.$emit('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(1)
  expect(wrapper.emitted().next).toHaveLength(1)
  next.vm.$emit('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(1)
  expect(wrapper.emitted().next).toHaveLength(2)
  prev.vm.$emit('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(2)
  expect(wrapper.emitted().next).toHaveLength(2)
})

it('prevents navigating to pages below 1', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const prev = wrapper.find('.pagination__button__prev')
  expect(prev.attributes('disabled')).toBe('true')
  prev.vm.$emit('click')
  await prev.vm.$nextTick()
  const emitted = wrapper.emitted().prev?.[0]
  expect(!emitted || emitted.length === 0).toBe(true)
})

it('prevents navigating to pages above {pageCount}', async () => {
  propsData.page = 10
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const next = wrapper.find('.pagination__button__next')
  expect(next.attributes('disabled')).toBe('true')
  next.vm.$emit('click')
  await next.vm.$nextTick()
  const emitted = wrapper.emitted().next?.[0]
  expect(!emitted || emitted.length === 0).toBe(true)

  wrapper.setProps({ ...propsData, page: 9 })
  await wrapper.vm.$nextTick()
  expect(next.attributes('disabled')).toBeUndefined()

  wrapper.setProps({ ...propsData, page: 10, pageCount: 11 })
  await wrapper.vm.$nextTick()
  expect(next.attributes('disabled')).toBeUndefined()
})

it('emits event when input changes', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const input = wrapper.find('input')
  input.setValue(5)
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().page).toEqual([['5']])
  input.setValue(7)
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().page).toEqual([['5'], ['7']])
})

it('prevents inputs out of page range', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const input = wrapper.find('input')
  input.setValue(-1)
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().page).toBeUndefined()
  input.setValue(12)
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().page).toEqual([[10]])
})

it('resets input on blur, if invalid', async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const input = wrapper.find('input')
  const inputElement = input.element as HTMLInputElement

  input.setValue(-1)
  await wrapper.vm.$nextTick()
  expect(inputElement.value).toEqual('-1')

  input.trigger('blur')
  await wrapper.vm.$nextTick()
  expect(inputElement.value).toEqual('1')
})

it("sets width based on current page if dynamic width it's enabled", async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const input = wrapper.find('input')
  const inputElement = input.element as HTMLInputElement
  wrapper.setProps({ pageCount: 100, dynamicWidth: true })
  await wrapper.vm.$nextTick()
  expect(inputElement.style.width).toEqual('24px')
})

it("sets width based on pageCount if dynamic width it's disabled", async () => {
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  const input = wrapper.find('input')
  const inputElement = input.element as HTMLInputElement
  wrapper.setProps({ pageCount: 100, dynamicWidth: false })
  await wrapper.vm.$nextTick()
  expect(inputElement.style.width).toEqual('40px')
})

it('enables document-wide navigation with "up" and "down"', async () => {
  propsData.page = 5
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })

  wrapper.find('input').trigger('keydown.up')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().next).toHaveLength(1)

  wrapper.find('input').trigger('keydown.up')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().next).toHaveLength(2)

  wrapper.find('input').trigger('keydown.down')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(1)

  wrapper.find('input').trigger('keydown.down')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(2)
})

it('enables document-wide navigation with "," and "."', async () => {
  propsData.page = 5
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '.' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['next-secondary']).toHaveLength(1)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: '.' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['next-secondary']).toHaveLength(2)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: ',' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['prev-secondary']).toHaveLength(1)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: ',' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['prev-secondary']).toHaveLength(2)
})

it('enables document-wide navigation with "<" and ">"', async () => {
  propsData.page = 5
  const wrapper = shallowMount(ChevronPagination, { localVue, propsData, mocks })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '>' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().next).toHaveLength(1)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: '>' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().next).toHaveLength(2)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: '<' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(1)

  document.dispatchEvent(new KeyboardEvent('keydown', { key: '<' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().prev).toHaveLength(2)
})
