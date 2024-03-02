import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildModelTemplatePayload } from 'test/unit/factories'

import ModelTypeSetup from '@/components/ModelCreation/ModelTypeSetup.vue'
import { installCommonComponents } from '@/plugins/components'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

const template = buildModelTemplatePayload({ id: 'a', type: ModelType.AutoAnnotation })

beforeEach(() => {
  store = createTestStore()
})

const model = {
  continueButton: 'primary-button-stub'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(ModelTypeSetup, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('enables continue button based on template selection + name', async () => {
  store.commit('neuralModel/VALIDATE_NEW_MODEL')

  const wrapper = shallowMount(ModelTypeSetup, { localVue, store })
  expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()

  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')

  await wrapper.vm.$nextTick()
  expect(wrapper.find(model.continueButton).attributes('disabled')).toBeFalsy()

  store.commit('neuralModel/SET_NEW_MODEL_NAME', '')
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  await wrapper.vm.$nextTick()
  expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()

  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', null)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  await wrapper.vm.$nextTick()
  expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()
})

it('emits "continue"', () => {
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  const wrapper = shallowMount(ModelTypeSetup, { localVue, store })

  wrapper.find(model.continueButton).vm.$emit('click')
  expect(wrapper.emitted().continue!.length).toBe(1)
})
