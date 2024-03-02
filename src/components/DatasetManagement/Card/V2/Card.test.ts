import { createLocalVue, shallowMount } from '@vue/test-utils'

import Card from './Card.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const propsData = { }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given slots', () => {
  const propsData = { }
  const slots = {
    'overlay-center': 'center',
    'overlay-top-left': 'topLeft',
    'overlay-top-right': 'topRight',
    details: 'details',
    status: 'status'
  }
  const wrapper = shallowMount(Card, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given thumbnail', () => {
  const propsData = { thumbnail: 'foo.png' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when external', () => {
  const propsData = { isExternal: true, thumbnail: 'foo.png' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dicom', () => {
  const propsData = { isDicom: true, thumbnail: 'foo.dcm' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when pdf', () => {
  const propsData = { isPdf: true, thumbnail: 'foo.pdf' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder', () => {
  const propsData = { type: 'folder' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when has priority', () => {
  const propsData = { priority: 1 }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video', () => {
  const propsData = { type: 'video' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video-frames', () => {
  const propsData = { type: 'video-frames' }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  const propsData = { isSelected: true }
  const wrapper = shallowMount(Card, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits "select" when clicked', async () => {
  const propsData = { isSelected: true }
  const wrapper = shallowMount(Card, { localVue, propsData })
  await wrapper.find('.card').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()
  expect(wrapper.emitted().select![0]).toEqual([expect.any(Event), false])

  await wrapper.setProps({ isSelected: false })

  await wrapper.find('.card').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()
  expect(wrapper.emitted().select![1]).toEqual([expect.any(Event), true])
})
