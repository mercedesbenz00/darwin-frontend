import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import ListItem from '@/components/DatasetManagement/ListItem/ListItem.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const stubs = ['check-box']
const date = '2000-01-01T00:00:00'

it('matches snapshot', () => {
  const propsData = { date, name: '0001', thumbnail: 'foo.png' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given thumbnail', () => {
  const propsData = { date, name: '0001', thumbnail: 'foo.png' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder', () => {
  const propsData = { date, name: 'folder', type: 'folder' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video', () => {
  const propsData = { date, name: '0001', thumbnail: 'foo.png', type: 'video' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when video-frames', () => {
  const propsData = { date, name: '0001', thumbnail: 'foo.png', type: 'video-frames' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  const propsData = { date, name: '0001', isSelected: true, thumbnail: 'foo.png' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits "select" when clicked', () => {
  const propsData = { date, name: '0001', isSelected: true, thumbnail: 'foo.png' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  wrapper.find('.list-item').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()

  wrapper.setProps({ isSelected: false })

  wrapper.find('.list-item').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()
})

it('emits "select" when checkbox emits "click" ', () => {
  const propsData = { date, name: '0001', isSelected: true, thumbnail: 'foo.png' }
  const wrapper = shallowMount(ListItem, { localVue, propsData, stubs })
  wrapper.find('.list-item').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()

  wrapper.setProps({ isSelected: false })

  wrapper.find('.list-item').trigger('click')
  expect(wrapper.emitted().select).toBeDefined()
})
