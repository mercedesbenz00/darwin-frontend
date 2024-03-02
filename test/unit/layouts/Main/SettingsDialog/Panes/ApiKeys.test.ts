import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { SettingsPane } from 'test/unit/stubs'

import loadingDirective from '@/directives/loading'
import ApiKeys from '@/layouts/Main/SettingsDialog/Panes/ApiKeys.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

const stubs: Stubs = { SettingsPane }

it('matches snapshot', () => {
  const wrapper = shallowMount(ApiKeys, { localVue, stubs })

  expect(wrapper).toMatchSnapshot()
})
