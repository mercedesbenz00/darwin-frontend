import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'

import ModelInference from '@/components/Models/ModelInference.vue'
import { InferenceResult } from '@/engineCommon/backend'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})

let propsData: {
  runningSession: RunningSessionPayload,
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  propsData = {
    runningSession: buildRunningSessionPayload({})
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ModelInference, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when image infered', async () => {
  const inferenceResults: InferenceResult[] = [
    { label: 'Foo', path: [] },
    { label: 'Bar', path: [] }
  ]

  jest.spyOn(store, 'dispatch').mockResolvedValue({ data: { result: inferenceResults } })

  const wrapper = shallowMount(ModelInference, { localVue, propsData, store })
  const file = new File(['fakecontent'], 'programmatically_created.png', { type: 'image/png' })
  await wrapper.find('droparea-stub').vm.$emit('file-added', file) // trigger event
  await flushPromises() // read image
  await flushPromises() // dispatch store action
  expect(wrapper).toMatchSnapshot()
})

it('dispatches toast and resets on store error', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
  const file = new File([''], 'foo.png', { type: 'image/png' })
  const wrapper = shallowMount(ModelInference, { localVue, propsData, store })
  await wrapper.find('droparea-stub').vm.$emit('file-added', file) // trigger event
  await flushPromises() // read image
  await flushPromises() // dispatch store action

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})
