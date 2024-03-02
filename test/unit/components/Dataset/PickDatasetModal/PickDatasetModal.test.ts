import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import PickDatasetModal from '@/components/Dataset/PickDatasetModal/PickDatasetModal.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let propsData: {
  destinationDataset: DatasetPayload
  selectedDataset?: DatasetPayload
}
const mocks = { $theme: createMockTheme() }

const dataset1 = buildDatasetPayload({ id: 10, name: 'foo' })
const dataset2 = buildDatasetPayload({ id: 20, name: 'test' })

const slots = {
  title: { template: '<span>Title</span>' },
  description: { template: '<span>Description</span>' }
}

beforeEach(() => {
  store = createTestStore()
  const destinationDataset = buildDatasetPayload({ id: 30 })
  store.commit('dataset/SET_DATASETS', [dataset1, dataset2, destinationDataset])
  propsData = { destinationDataset }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  expect(wrapper).toMatchSnapshot()
})

it('fetches datasets', () => {
  shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/getDatasets')
})

it('does not render destination dataset', () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(2)
})

it('matches snapshot on search', async () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  await wrapper.find('search-field-stub').vm.$emit('input', 'foo')
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(1)
})

it('matches snapshot on no matching dataset after search', async () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  await wrapper.find('search-field-stub').vm.$emit('input', 'no-match')
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(0)
})

it('matches snapshot when dataset is selected', async () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  await wrapper.find('dataset-card-stub').vm.$emit('click')
  expect(wrapper).toMatchSnapshot()
})

it('emits updated selected dataset when you click on the dataset card', async () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  await wrapper.find('dataset-card-stub').vm.$emit('click')
  expect(wrapper.emitted()['update:selectedDataset']).toEqual([[dataset1]])
})

it('emits select when you dblclick on the dataset card', async () => {
  const wrapper = shallowMount(PickDatasetModal, { localVue, mocks, propsData, slots, store })
  await wrapper.find('dataset-card-stub').vm.$emit('dblclick')
  expect(wrapper.emitted()['update:selectedDataset']).toEqual([[dataset1]])
  expect(wrapper.emitted().select).toBeDefined()
})
