import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetItemFilter,
  buildDatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { emitRootStub, rootStubProps } from 'test/unit/testHelpers'

import { DatasetItemFilter, DatasetPayload } from '@/store/types'

import SelectAllContextMenuItem from './SelectAllContextMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  dataset: DatasetPayload,
  filter: DatasetItemFilter,
  selectedItemCount: number
}

let store: ReturnType<typeof createTestStore>

let mocks: { $can: () => boolean}

const items = [
  buildDatasetItemPayload({ id: 1, seq: 1 }),
  buildDatasetItemPayload({ id: 2, seq: 2 }),
  buildDatasetItemPayload({ id: 3, seq: 3 }),
  buildDatasetItemPayload({
    id: 4,
    seq: 4,
    archived: true
  })
]

beforeEach(() => {
  mocks = { $can: (): boolean => true }
  const dataset = buildDatasetPayload({ id: 1, name: 'Test' })
  propsData = { dataset, filter: buildDatasetItemFilter({}), selectedItemCount: 5 }
  store = createTestStore()
})

class ComponentModel extends Model {
  click (): Promise<void> {
    return emitRootStub(this.wrapper, 'click')
  }

  get label (): string {
    return rootStubProps(this.wrapper, 'label')
  }

  get tooltip (): string {
    return rootStubProps(this.wrapper, 'tooltip')
  }
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(SelectAllContextMenuItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when all items are selected', () => {
  beforeEach(() => {
    const counts = buildDatasetDetailPayload({ id: 5, item_count: 4 })
    store.commit('dataset/PUSH_DATASET_DETAILS', counts)
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  })

  itMatchesSnapshot()

  it('renders Deselect button', () => {
    const wrapper = shallowMount(SelectAllContextMenuItem, { localVue, propsData, store })
    const model = new ComponentModel(wrapper)
    expect(model.label).toEqual('DESELECT ALL')
    expect(model.tooltip).toContain('Esc')
  })

  it('deselects all items', async () => {
    expect(store.state.dataset.selectedAll).toBe(true)
    const wrapper = shallowMount(SelectAllContextMenuItem, { localVue, propsData, store })
    const model = new ComponentModel(wrapper)
    await model.click()
    expect(store.state.dataset.selectedAll).toBe(false)
  })
})

describe('when only some items are selected', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: items.slice(2, 4), selected: true })
  })

  it('renders Select All button', () => {
    const wrapper = shallowMount(SelectAllContextMenuItem, { localVue, propsData, store })
    const model = new ComponentModel(wrapper)

    expect(model.label).toEqual('SELECT ALL')
    expect(model.tooltip).toContain('CTRL + A')
  })

  it('selects all items', async () => {
    expect(store.state.dataset.selectedAll).toBe(false)
    const wrapper = shallowMount(SelectAllContextMenuItem, { localVue, propsData, store })
    const model = new ComponentModel(wrapper)
    await model.click()
    expect(store.state.dataset.selectedAll).toBe(true)
  })
})
