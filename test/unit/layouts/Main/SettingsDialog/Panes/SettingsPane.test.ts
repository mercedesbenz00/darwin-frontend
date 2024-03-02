import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import loadingDirective from '@/directives/loading'
import SettingsPane from '@/layouts/Main/SettingsDialog/Panes/SettingsPane.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)
installCommonComponents(localVue)

it('matches snapshot', () => {
  const propsData = { title: 'Random Settings Pane' }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  const propsData = { title: 'Loading Pane', loading: true }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when body slot given', () => {
  const propsData = { title: 'Body Slot Pane' }
  const slots = {
    body: '<div class="body-content"></div>'
  }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData, slots })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when default slot given', () => {
  const propsData = { title: 'Default Slot Pane' }
  const slots = {
    default: '<div class="default-content"></div>'
  }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData, slots })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when footer slot given', () => {
  const propsData = { title: 'Footer Slot Pane' }
  const slots = {
    footer: '<div class="footer-content"></div>'
  }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData, slots })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when footer disabled', () => {
  const propsData = { title: 'Footer Disabled Pane', footer: false }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when all slots given', () => {
  const propsData = { title: 'All Slot Pane' }
  const slots = {
    body: '<div class="body-content"></div>',
    default: '<div class="default-content"></div>',
    footer: '<div class="footer-content"></div>'
  }
  const wrapper = shallowMount(SettingsPane, { localVue, propsData, slots })

  expect(wrapper).toMatchSnapshot()
})
