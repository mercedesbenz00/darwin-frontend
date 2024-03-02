import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetPayload,
  buildV2DARCWorkflow,
  buildV2DatasetItemFilter,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import clickOutsideDirective from '@/directives/click-outside'
import { DatasetItemStatus, StageType, V2DatasetStagePayload } from '@/store/types'

import ManagementContextMenu from './ManagementContextMenu.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

const ActionBarDefault = localVue.extend({
  name: 'ActionBarDefault',
  template: `
  <div data-stub="ActionBarDefault">
    <div data-slot="default"><slot /></div>
    <div data-slot="icon"><slot name="icon" /></div>
    <div data-slot="popover"><slot name="popover" /></div>
  </div>
  `
})

const stubs: Stubs = { ActionBarDefault }

localVue.use(Vuex)
localVue.use(VModal)
localVue.directive('click-outside', clickOutsideDirective)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $toast: {
    success: Function,
    warning: Function
  },
  $modal: {
    show: () => void
    hide: () => void
  }
}
const items = [
  buildV2DatasetItemPayload({ id: '1' }),
  buildV2DatasetItemPayload({ id: '2' }),
  buildV2DatasetItemPayload({ id: '3' }),
  buildV2DatasetItemPayload({
    id: '4',
    archived: true,
    status: DatasetItemStatus.archived
  }),
  buildV2DatasetItemPayload({
    id: '5',
    status: DatasetItemStatus.processing
  })
]

const propsData = {
  dataset: buildDatasetPayload(),
  datasetItems: items
}

const workflow = buildV2DARCWorkflow()
const datasetStage =
  workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
datasetStage.config!.dataset_id = propsData.dataset.id

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $toast: {
      success: jest.fn(),
      warning: jest.fn()
    },
    $modal: { show: jest.fn(), hide: jest.fn() }
  }
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
})

const model = {
  archive: 'action-bar-danger-stub#action-danger',
  assign: 'div#action-assign',
  assignDisabled: 'div#action-assign-disabled',
  delete: 'action-bar-danger-stub#action-danger',
  newFolder: 'action-bar-default-stub#action-folder',
  priority: 'action-bar-default-stub#action-priority',
  restore: 'action-bar-restore-stub',
  selectAll: 'action-bar-select-stub'
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(ManagementContextMenu, { localVue, propsData, store, stubs, mocks })
  expect(wrapper).toMatchSnapshot()
})

describe('when nothing is selected', () => {
  itMatchesSnapshot()
})

describe('when items individualy selected and user allowed to perform actions', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['2', '3', '4'])
  })

  itMatchesSnapshot()

  it('sets priority', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-priority-stub').vm.$emit('set-priority', 4)
    expect(store.dispatch).toHaveBeenCalledWith('dataset/addPriorityToV2Items', {
      dataset: propsData.dataset,
      filters: { item_ids: ['2', '3', '4'] },
      priority: 4
    })
  })

  it('assigns', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-assign-stub').vm.$emit('assign', 'foo')
    expect(store.dispatch).toHaveBeenCalledWith('dataset/assignV2Items', {
      assignee: 'foo',
      dataset: propsData.dataset,
      workflow,
      filters: { item_ids: ['2', '3', '4'] }
    })
  })

  it('sets stage', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-stage-stub').vm.$emit('set-stage', 'foo')
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setV2Stage', {
      dataset: propsData.dataset,
      filters: { item_ids: ['2', '3', '4'] },
      stage: 'foo',
      workflow
    })
  })

  it('discards annotations', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-stage-stub').vm.$emit('discard-annotations')
    expect(store.dispatch).toHaveBeenCalledWith('dataset/deleteV2Annotations', {
      dataset: propsData.dataset,
      filters: { item_ids: ['2', '3', '4'] },
      workflow
    })
  })
})

describe('when you have selected archived & non-archived items', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['2', '3', '4'])
  })

  itMatchesSnapshot()

  it('should render archive button only', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    expect(wrapper.find(model.archive).exists()).toBeTruthy()
    expect(wrapper.find(model.restore).exists()).toBeFalsy()
  })
})

describe('when you have selected archived items', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['4'])
  })

  itMatchesSnapshot()

  it('should render restore and permanent delete buttons', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    expect(wrapper.find(model.restore).exists()).toBeTruthy()
    expect(wrapper.find(model.delete).attributes().mode).toEqual('delete')
  })
})

describe('when you have selected processing items', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['1', '5'])
  })

  itMatchesSnapshot()

  it('should render assign button disabled', () => {
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    expect(wrapper.find(model.assign).exists()).toBeFalsy()
    expect(wrapper.find(model.assignDisabled).exists()).toBeTruthy()
  })
})

describe('when selecting all', () => {
  beforeEach(() => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  })

  it('renders restore and delete button when filtering to archived status only', () => {
    const filter = buildV2DatasetItemFilter({ statuses: [DatasetItemStatus.archived] })
    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', filter)
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    expect(wrapper.find(model.restore).exists()).toBeTruthy()
    expect(wrapper.find(model.delete).exists()).toBeTruthy()
  })

  it('opens delete confirmation modal on click delete button', async () => {
    const filter = buildV2DatasetItemFilter({ statuses: [DatasetItemStatus.archived] })
    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', filter)
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    await wrapper.find(model.delete).vm.$emit('click')
    expect(mocks.$modal.show).toHaveBeenCalled()
  })

  it('send action request without applying unnecessary filters', () => {
    const filter = buildV2DatasetItemFilter({
      statuses: [DatasetItemStatus.archived, DatasetItemStatus.new],
      include_thumbnails: true,
      include_workflow_data: true
    })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', filter)
    store.commit('dataset/SET_SELECTED_ITEMS', ['1', '2', '3', '4'])
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-priority-stub').vm.$emit('set-priority', 3)
    expect(store.dispatch).toHaveBeenCalledWith('dataset/addPriorityToV2Items', {
      dataset: propsData.dataset,
      filters: { select_all: true, statuses: [DatasetItemStatus.archived, DatasetItemStatus.new] },
      priority: 3
    })
  })

  it('does not render delete button when filter could result in non-archived items', () => {
    const filter = buildV2DatasetItemFilter({
      statuses: [DatasetItemStatus.archived, DatasetItemStatus.new]
    })

    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', filter)
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    expect(wrapper.find(model.delete).attributes().mode).toEqual('archive')
  })

  it('sends select_all: true in filters request for batch actions', () => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['1', '2', '3', '4'])
    const wrapper = shallowMount(
      ManagementContextMenu,
      { localVue, propsData, store, stubs, mocks }
    )
    wrapper.find('context-menu-popover-priority-stub').vm.$emit('set-priority', 3)
    expect(store.dispatch).toHaveBeenCalledWith('dataset/addPriorityToV2Items', {
      dataset: propsData.dataset,
      filters: { select_all: true },
      priority: 3
    })
  })
})
