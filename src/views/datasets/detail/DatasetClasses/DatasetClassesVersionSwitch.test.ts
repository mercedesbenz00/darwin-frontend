import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import DatasetClassesVersionSwitch from '@/views/datasets/detail/DatasetClasses/DatasetClassesVersionSwitch.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

const sfhDataset = buildDatasetPayload({
  id: 1,
  name: 'Dataset'
})

beforeEach(() => { store = createTestStore() })

it('matches snapshot for v1.0 dataset', () => {
  const propsData = { dataset: sfhDataset }
  const wrapper = shallowMount(DatasetClassesVersionSwitch, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot for v2.0 dataset', () => {
  const propsData = { dataset: { ...sfhDataset, version: 2 } }
  const wrapper = shallowMount(DatasetClassesVersionSwitch, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
