import { createLocalVue, shallowMount } from '@vue/test-utils'

import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

const defaultProps = { label: 'Context Menu Item' }
it('matches snapshot without icon', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { ...defaultProps }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with icon', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { ...defaultProps, icon: 'foo.svg' }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with color', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { ...defaultProps, color: 'pink' }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { ...defaultProps, disabled: true }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with empty label', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { label: '' }
  })
  expect(wrapper).toMatchSnapshot()
})

it('emits click event when clicked', () => {
  const wrapper = shallowMount(GalleryContextMenuItem, {
    localVue,
    propsData: { ...defaultProps }
  })
  wrapper.find('.gallery-context-menu__item').vm.$emit('click')
  expect(wrapper.emitted().click).toBeDefined()
})
