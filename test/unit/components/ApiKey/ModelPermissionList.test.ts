import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import ModelPermissionList from '@/components/ApiKey/ModelPermissionList.vue'
import ui, { getInitialState as getInitialUIState } from '@/store/modules/ui'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

const permissions = [
  ['run_inference', 'model:abcdef'],
  ['run_inference', 'model:fedcba']
]

it('matches snapshot', () => {
  const propsData = { permissions }
  const wrapper = shallowMount(ModelPermissionList, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('closes settings and navigates to models on info click', () => {
  const propsData = { permissions }

  localVue.use(Vuex)
  const store = new Vuex.Store<RootState>({ modules: { ui: { ...ui, state: getInitialUIState() } } })
  store.commit('ui/SET_SHOW_SETTINGS', true)
  expect(store.state.ui.showSettings).toBe(true)

  const $router = { push: jest.fn() }
  const mocks = { $router }

  const wrapper = shallowMount(ModelPermissionList, {
    localVue, mocks, propsData, store
  })

  wrapper.find('info-stub').trigger('click')
  expect(store.state.ui.showSettings).toBe(false)
  expect($router.push).toHaveBeenCalledWith('/models')
})
