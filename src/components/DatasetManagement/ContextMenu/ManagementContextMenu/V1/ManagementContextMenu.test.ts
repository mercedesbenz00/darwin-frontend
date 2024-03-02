import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemFilter,
  buildDatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import { DatasetItemStatus, DatasetPayload } from '@/store/types'

import ManagementContextMenu from './ManagementContextMenu.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let dataset: DatasetPayload
let propsData: { dataset: DatasetPayload }
let store: ReturnType<typeof createTestStore>

const items = [
  buildDatasetItemPayload({ id: 1, seq: 1 }),
  buildDatasetItemPayload({ id: 2, seq: 2 }),
  buildDatasetItemPayload({ id: 3, seq: 3 }),
  buildDatasetItemPayload({
    id: 4,
    seq: 4,
    archived: true,
    status: DatasetItemStatus.archived
  })
]

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 5 })
  store = createTestStore()
  store.commit('dataset/SET_DATASET_ITEMS', items)
  propsData = { dataset }
})

const model = {
  archive: 'archive-context-menu-item-stub',
  assign: 'assign-items-context-menu-item-stub',
  confirmModal: 'delete-confirmation-dialog-stub',
  delete: 'delete-context-menu-item-stub',
  newFolder: 'new-folder-context-menu-item-stub',
  priority: 'priority-context-menu-item-stub',
  restore: 'restore-context-menu-item-stub',
  selectAll: 'select-all-context-menu-item-stub'
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when nothing is selected', () => {
  itMatchesSnapshot()
})

describe('when items individualy selected and user allowed to perform actions', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: items.slice(0, 2), selected: true })
  })

  itMatchesSnapshot()
})

describe('when you have selected archived & non-archived items', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: items.slice(2, 4), selected: true })
  })

  itMatchesSnapshot()

  it('should render archive button only', () => {
    const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store })
    expect(wrapper.find(model.archive).exists()).toBeTruthy()
    expect(wrapper.find(model.restore).exists()).toBeFalsy()
    expect(wrapper.find(model.delete).exists()).toBeFalsy()
  })
})

describe('when you have selected archived items', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: items.slice(3, 4), selected: true })
  })

  itMatchesSnapshot()

  it('should render restore and permanent delete buttons', () => {
    const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store })
    expect(wrapper.find(model.restore).exists()).toBeTruthy()
    expect(wrapper.find(model.delete).exists()).toBeTruthy()
  })
})

describe('when selecting all', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  })

  it('renders restore and delete button when filtering to archived status only', () => {
    const filter = buildDatasetItemFilter({ statuses: [DatasetItemStatus.archived] })
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
    const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store })
    expect(wrapper.find(model.restore).exists()).toBeTruthy()
    expect(wrapper.find(model.delete).exists()).toBeTruthy()
  })

  it('does not render delete button when filter could result in non-archived items', () => {
    const filter = buildDatasetItemFilter({
      statuses: [DatasetItemStatus.archived, DatasetItemStatus.new]
    })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
    const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store })
    expect(wrapper.find(model.delete).exists()).toBeFalsy()
  })
})
