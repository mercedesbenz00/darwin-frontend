import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildWorkflowTemplatePayload } from 'test/unit/factories'

import NewStage from '@/components/DatasetSettings/Stage/NewStage.vue'
import { FeaturePayload, StageType, WorkflowTemplatePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let template: WorkflowTemplatePayload
let propsData: {
  template: WorkflowTemplatePayload
}

beforeEach(() => {
  template = buildWorkflowTemplatePayload({ id: 1 })
  propsData = { template }
})

const FEATURE: FeaturePayload['name'] = 'MODEL_STAGE'
let mocks: {
  $featureEnabled: (f: FeaturePayload['name']) => boolean
  $router: { push: jest.Mock },
  $route: { query: { } }
}

beforeEach(() => {
  mocks = {
    $featureEnabled: (f: FeaturePayload['name']): boolean => f === FEATURE,
    $router: { push: jest.fn() },
    $route: { query: { } }
  }
})

it('matches snapshot', () => {
  mocks.$featureEnabled = (): boolean => false
  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when MODEL_STAGE enabled', () => {
  mocks.$featureEnabled = (feature): boolean => feature === 'MODEL_STAGE'
  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when CODE_STAGE enabled', () => {
  mocks.$featureEnabled = (feature): boolean => feature === 'CODE_STAGE'
  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits create when Annotate type is selected', async () => {
  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  await wrapper.findAll('.stage-create__type').at(0).vm.$emit('click')
  expect(wrapper.emitted().create).toEqual([[StageType.Annotate]])
})

it('emits create when Review type is selected', async () => {
  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  await wrapper.findAll('.stage-create__type').at(1).vm.$emit('click')
  expect(wrapper.emitted().create).toEqual([[StageType.Review]])
})

it('emits create when Code type is selected', async () => {
  mocks.$featureEnabled = (feature): boolean => feature === 'CODE_STAGE'

  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  await wrapper.findAll('.stage-create__type').at(2).vm.$emit('click')
  expect(wrapper.emitted().create).toEqual([[StageType.Code]])
})

it('emits create when Model type is selected', async () => {
  mocks.$featureEnabled = (feature): boolean => feature === 'MODEL_STAGE'

  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  await wrapper.findAll('.stage-create__type').at(2).vm.$emit('click')
  expect(wrapper.emitted().create).toEqual([[StageType.Model]])
})

it('emits create when Test type is selected', async () => {
  mocks.$featureEnabled = (feature): boolean => feature === 'BLIND_STAGE'

  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData })
  await wrapper.findAll('.stage-create__type').at(2).vm.$emit('click')
  expect(wrapper.emitted().create).toEqual([[StageType.Test]])
})

it('dispatches toast and shows upgrade ui when creating test stage and feature off', async () => {
  mocks.$featureEnabled = (): boolean => false
  localVue.use(Vuex)
  const store = createTestStore()

  const wrapper = shallowMount(NewStage, { localVue, mocks, propsData, store })
  await wrapper.findAll('.stage-create__type').at(2).vm.$emit('click')
  expect(wrapper.emitted().create).toBeUndefined()
  expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
  expect(mocks.$router.push).toHaveBeenCalledWith({
    query: { settings: 'plans', upgrade: 'business' }
  })
})
