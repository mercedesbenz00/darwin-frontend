import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'

import { buildApiKeyPayload } from 'test/unit/factories'
import { Modal, Transition } from 'test/unit/stubs'

import KeyListItem from '@/components/ApiKey/KeyListItem.vue'

const localVue = createLocalVue()
localVue.use(VueJSModal)

const stubs = { Modal, Transition }

const key = buildApiKeyPayload({
  id: 1,
  name: 'Some Key',
  prefix: 'abcdefg',
  permissions: [['view_models', 'all'], ['run_inference', 'model:1']]
})

it('matches snapshot', () => {
  const propsData = { apiKey: key }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when expanded', async () => {
  const propsData = { apiKey: key }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, stubs })
  wrapper.find('.api-key__header').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given a default slot', () => {
  const propsData = { apiKey: key }
  const slots = { default: '<div class="default-content"></div>' }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given an icon slot', () => {
  const propsData = { apiKey: key }
  const slots = { icon: '<div class="icon-content"></div>' }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given all slots', () => {
  const propsData = { apiKey: key }
  const slots = {
    default: '<div class="default-content"></div>',
    icon: '<div class="icon-content"></div>'
  }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('expands and collapses', async () => {
  const propsData = { apiKey: key }
  const wrapper = shallowMount(KeyListItem, { localVue, propsData, stubs })
  wrapper.find('.api-key__header').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.expanded).toBe(true)
  expect(wrapper.find('.api-key--expanded').exists()).toBe(true)

  wrapper.find('.api-key__header').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.expanded).toBe(false)
  expect(wrapper.find('.api-key--expanded').exists()).toBe(false)
})
