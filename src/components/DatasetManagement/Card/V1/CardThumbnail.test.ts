import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import CardThumbnail from '@/components/DatasetManagement/Card/V1/CardThumbnail.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

it('matches snapshot', () => {
  const propsData = { url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder', () => {
  const propsData = { type: 'folder' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder and url is null', () => {
  const propsData = { type: 'folder', url: 'url' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video', () => {
  const propsData = { type: 'video', url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video-frames', () => {
  const propsData = { type: 'video-frames', url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dicom', () => {
  const propsData = { isDicom: true, type: 'video', url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dicom', () => {
  const propsData = { isPdf: true, type: 'video', url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders loading animation if url is falsy', async () => {
  const propsData = { url: 'foo' }
  const wrapper = shallowMount(CardThumbnail, { localVue, propsData })
  expect(wrapper.find('.card-thumbnail__placeholder').exists()).toBe(false)

  wrapper.setProps({ url: null })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.card-thumbnail__placeholder').exists()).toBe(true)

  wrapper.setProps({ url: undefined })
  await wrapper.vm.$nextTick()
  expect(wrapper.find('.card-thumbnail__placeholder').exists()).toBe(true)
})
