import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { DatasetPayload } from '@/store/types'

import DatasetConnectedChild from './Connected.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let dataset: DatasetPayload

let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  dataset = buildDatasetPayload()
  propsData = { dataset }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetConnectedChild, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
