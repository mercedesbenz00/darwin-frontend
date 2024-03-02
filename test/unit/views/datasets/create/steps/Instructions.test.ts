import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import { DatasetPayload, StoreActionPayload } from '@/store/types'
import Instructions from '@/views/datasets/create/steps/Instructions.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: { dataset: DatasetPayload }

let mocks: {
  $ga: { event: Function },
  $router: { push: Function }
}

const sfh = buildDatasetPayload({ id: 99, name: 'SFH' })

beforeEach(() => {
  store = createTestStore()
  propsData = { dataset: sfh }
  mocks = {
    $ga: { event: jest.fn() },
    $router: { push: jest.fn() }
  }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(Instructions, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  await flushPromises() // wait on froala load
  expect(wrapper).toMatchSnapshot('froala loaded')
  expect(wrapper.find('froala-stub').exists()).toBe(true)
})

it('dispatches to store on continue', async () => {
  const wrapper = shallowMount(Instructions, { localVue, mocks, propsData, store })
  await flushPromises() // wait on froala load
  await wrapper.find('froala-stub').vm.$emit('input', 'New instructions')
  await wrapper.find('positive-button-stub').vm.$emit('click')

  const payload: StoreActionPayload<typeof updateDataset> = {
    dataset: sfh,
    params: { instructions: 'New instructions' }
  }

  expect(store.dispatch).toHaveBeenCalledWith('dataset/updateDataset', payload)
})
