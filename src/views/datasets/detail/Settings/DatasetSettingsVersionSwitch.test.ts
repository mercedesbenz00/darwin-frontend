import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import DatasetSettingsVersionSwitch from '@/views/datasets/detail/Settings/DatasetSettingsVersionSwitch.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

const sfhDataset = buildDatasetPayload({
  id: 1,
  name: 'Dataset',
  version: 1
})

beforeEach(() => { store = createTestStore() })

it('matches snapshot for v1.0 dataset', () => {
  const propsData = { dataset: sfhDataset }
  const wrapper = shallowMount(DatasetSettingsVersionSwitch, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot for v2.0 dataset', () => {
  const propsData = { dataset: { ...sfhDataset, version: 2 } }
  const wrapper = shallowMount(DatasetSettingsVersionSwitch, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
