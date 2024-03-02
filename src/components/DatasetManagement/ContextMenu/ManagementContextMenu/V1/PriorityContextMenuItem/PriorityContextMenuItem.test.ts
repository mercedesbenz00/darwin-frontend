import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemFilter,
  buildDatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import { DatasetItemFilter, DatasetPayload } from '@/store/types'

import PriorityContextMenuItem from './PriorityContextMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = { VPopover }

let propsData: {
  dataset: DatasetPayload,
  filter: DatasetItemFilter
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  propsData = {
    dataset: buildDatasetPayload({ id: 1 }),
    filter: buildDatasetItemFilter({ dataset_item_ids: [1, 2] })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PriorityContextMenuItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when opened', async () => {
  const wrapper = shallowMount(PriorityContextMenuItem, { localVue, propsData, store, stubs })
  await wrapper.find('gallery-context-menu-item-stub').vm.$emit('click')
  expect(wrapper).toMatchSnapshot()
})

it('dispatches store action when priority is set', async () => {
  const wrapper = shallowMount(PriorityContextMenuItem, { localVue, propsData, store, stubs })

  await wrapper.find('priority-form-stub').vm.$emit('update:priority', 1)
  await wrapper.find('priority-form-stub').vm.$emit('submit')

  expect(store.dispatch).toHaveBeenCalledWith('dataset/addPriorityToItems', {
    dataset: propsData.dataset,
    filter: propsData.filter,
    priority: 1
  })
})

it('deselects all items on action success', async () => {
  const items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 })
  ]
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })

  const wrapper = shallowMount(PriorityContextMenuItem, { localVue, propsData, store, stubs })

  expect(store.state.dataset.selectedItemIds).toEqual([1, 2])

  await wrapper.find('priority-form-stub').vm.$emit('update:priority', 1)
  await wrapper.find('priority-form-stub').vm.$emit('submit')
  await flushPromises()

  expect(store.state.dataset.selectedItemIds).toEqual([])
})
