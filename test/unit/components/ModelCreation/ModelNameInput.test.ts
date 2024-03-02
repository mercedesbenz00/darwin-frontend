import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { emitRootStub } from 'test/unit/testHelpers'

import ModelNameInput from '@/components/ModelCreation/ModelNameInput.vue'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ModelNameInput, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders model name from store', async () => {
  const wrapper = shallowMount(ModelNameInput, { localVue, store })
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('input-field-stub').attributes('value')).toEqual('foo')
})

it('sets name in store on change', async () => {
  const wrapper = shallowMount(ModelNameInput, { localVue, store })
  await emitRootStub(wrapper, 'change', 'bar')
  expect(store.state.neuralModel.newModelName).toEqual('bar')
})

it('generates model name from type', async () => {
  const wrapper = shallowMount(ModelNameInput, { localVue, store })

  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.AutoAnnotation)
  await wrapper.vm.$nextTick()

  const generated = wrapper.find('input-field-stub').attributes('value')
  expect(generated).toContain('A-A')

  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.InstanceSegmentation)
  await wrapper.vm.$nextTick()

  const generated2 = wrapper.find('input-field-stub').attributes('value')
  expect(generated2).toContain('Inst-Seg')
})

it('generates model name on mount', () => {
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.AutoAnnotation)
  expect(store.state.neuralModel.newModelName).toEqual('')
  shallowMount(ModelNameInput, { localVue, store })
  expect(store.state.neuralModel.newModelName).not.toEqual('')
})

it('generates model name on click', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.AutoAnnotation)
  const wrapper = shallowMount(ModelNameInput, { localVue, store })
  const name = store.state.neuralModel.newModelName

  expect(name).not.toEqual('')
  await wrapper.find('button').trigger('click')
  expect(store.state.neuralModel.newModelName).not.toEqual(name)
})

it('does not regenerate model name on mount', () => {
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.AutoAnnotation)
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  shallowMount(ModelNameInput, { localVue, store })
  expect(store.state.neuralModel.newModelName).toEqual('foo')
})

it('sets model error', async () => {
  const wrapper = shallowMount(ModelNameInput, { localVue, store })
  expect(wrapper.find('input-field-stub').props('error')).toBeFalsy()
  store.commit('neuralModel/SET_NEW_MODEL_NAME', '')
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('input-field-stub').props('error')).toBeTruthy()
})
