import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import DatasetCard from '@/components/ModelCreation/DatasetCard.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  const dataset = buildDatasetPayload({
    name: 'Test name',
    num_images: 500,
    num_classes: 600,
    num_annotations: 700
  })

  propsData = { dataset }
})

describe('when not selected', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders as unselected', () => {
    const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
    expect(wrapper.find('.dataset--selected').exists()).toBe(false)
  })
})

describe('when selected', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', propsData.dataset)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders as selected', () => {
    const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
    expect(wrapper.find('.dataset--selected').exists()).toBe(true)
  })
})

it('renders data', () => {
  const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
  expect(wrapper.text()).toContain('Test name')
  expect(wrapper.findAll('.count__value').at(0).text()).toEqual('500')
  expect(wrapper.findAll('.count__value').at(1).text()).toEqual('600')
  expect(wrapper.findAll('.count__value').at(2).text()).toEqual('700')
})

it('sets selection to store on click', async () => {
  const wrapper = shallowMount(DatasetCard, { localVue, propsData, store })
  await wrapper.find('[role=button]').trigger('click')
  expect(store.state.neuralModel.newModelDataset).toEqual(propsData.dataset)
})
