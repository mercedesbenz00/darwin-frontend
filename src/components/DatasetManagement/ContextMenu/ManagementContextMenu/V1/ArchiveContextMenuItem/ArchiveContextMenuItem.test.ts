import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemFilter,
  buildDatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { emitRootStub } from 'test/unit/testHelpers'

import { DatasetItemFilter, DatasetPayload } from '@/store/types'
import { errorsByCode } from '@/utils'

import ArchiveContextMenuItem from './ArchiveContextMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  dataset: DatasetPayload,
  filter: DatasetItemFilter,
  selectedItemCount: number
}

let store: ReturnType<typeof createTestStore>

let mocks: { $can: () => boolean}

beforeEach(() => {
  mocks = { $can: (): boolean => true }
  const dataset = buildDatasetPayload({ id: 1, name: 'Test' })
  propsData = { dataset, filter: buildDatasetItemFilter({}), selectedItemCount: 5 }
  store = createTestStore()
})

class ComponentModel extends Model {
  archive (): Promise<void> {
    return emitRootStub(this.wrapper, 'click')
  }
}

it('matches snapshot', () => {
  const wrapper = shallowMount(ArchiveContextMenuItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches toast if user is not allowed to archive', async () => {
  mocks.$can = (): boolean => false
  const wrapper = shallowMount(ArchiveContextMenuItem, { localVue, mocks, propsData, store })
  const model = new ComponentModel(wrapper)
  await model.archive()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
    content: errorsByCode.DATASET_IMAGE_DELETE_NOT_AUTHORIZED
  })
})

it('dispatches action if user allowed to archive', async () => {
  const wrapper = shallowMount(ArchiveContextMenuItem, { localVue, mocks, propsData, store })
  const model = new ComponentModel(wrapper)
  await model.archive()

  expect(store.dispatch).toHaveBeenCalledWith('dataset/archiveDatasetItems', {
    dataset: propsData.dataset,
    filter: propsData.filter
  })
})

it('dispatches toast on archive failure', async () => {
  const wrapper = shallowMount(ArchiveContextMenuItem, { localVue, mocks, propsData, store })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
  const model = new ComponentModel(wrapper)
  await model.archive()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})

it('deselects all items on archive success', async () => {
  const items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 })
  ]
  store.commit('dataset/SET_DATASET_ITEMS', items)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })

  expect(store.state.dataset.selectedItemIds).toEqual([1, 2])

  const wrapper = shallowMount(ArchiveContextMenuItem, { localVue, mocks, propsData, store })
  const model = new ComponentModel(wrapper)
  await model.archive()
  await flushPromises()

  expect(store.state.dataset.selectedItemIds).toEqual([])
})
