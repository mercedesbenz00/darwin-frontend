import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import NewModelView from '@/views/models/NewModelView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const Wizard = localVue.extend({
  props: ['steps'],
  template: `
  <div class="wizard-stub">
    <div v-for="(step, index) in steps" :key="index">
      <slot name="step" v-bind:index="index" v-bind:onContinue="() => {}" />
    </div>
  </div>
  `
})

const stubs = { Wizard }

let store: ReturnType<typeof createTestStore>
const mocks = {
  $route: { path: '/models/new/fake-id' }
}

beforeEach(() => {
  store = createTestStore()
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'Random new model')
})

it('matches snapshot', () => {
  const wrapper = shallowMount(NewModelView, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('sets breadcrumbs correctly', () => {
  shallowMount(NewModelView, { localVue, mocks, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('ui/setBreadCrumbs', [
    { to: '/models', name: 'Models' },
    { name: 'New Model' }
  ])
})

it('returns to step 1 on model name error', () => {
  const wrapper = shallowMount(NewModelView, { localVue, mocks, store })
  wrapper.find('wizard-stub').vm.$emit('update:step', 2)
  store.commit('neuralModel/SET_NEW_MODEL_NAME', '')
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  expect(wrapper.find('wizard-stub').props('step')).toEqual(0)
})

it('renders validator', () => {
  const wrapper = shallowMount(NewModelView, { localVue, mocks, store, stubs })
  expect(wrapper.find('new-model-validator-stub').exists()).toBe(true)
})
