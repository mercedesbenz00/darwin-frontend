import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemFilter,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload,
  buildMembershipPayload,
  buildUserPayload
} from 'test/unit/factories'
import { initializeARTemplate, initializeMTemplate } from 'test/unit/factories/helpers'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'
import { VPopover } from 'test/unit/stubs'

import {
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  WorkflowTemplatePayload
} from '@/store/types'

import AssignItemsContextMenuItem from './AssignItemsContextMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = { VPopover }

let listeners: { select: ReturnType<typeof jest.fn> }
let store: ReturnType<typeof createTestStore>
let propsData: {
  dataset: DatasetPayload
  filter: DatasetItemFilter
}
let items: DatasetItemPayload[]

let arTemplate: WorkflowTemplatePayload
let mTemplate: WorkflowTemplatePayload
let sfh: DatasetPayload

beforeEach(() => {
  store = createTestStore()

  sfh = buildDatasetPayload({ id: 5 })
  arTemplate = initializeARTemplate(sfh)

  store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', arTemplate)

  sfh.default_workflow_template_id = arTemplate.id
  store.commit('dataset/PUSH_DATASET', sfh)

  listeners = { select: jest.fn() }
  propsData = { dataset: sfh, filter: buildDatasetItemFilter({ dataset_item_ids: [1, 2] }) }

  items = [
    buildDatasetItemPayload({ id: 1, dataset_id: sfh.id, status: DatasetItemStatus.new }),
    buildDatasetItemPayload({ id: 2, dataset_id: sfh.id, status: DatasetItemStatus.new })
  ]

  store.commit('dataset/SET_DATASET_ITEMS', items)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AssignItemsContextMenuItem, {
    localVue, listeners, propsData, store, stubs
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when assigning', () => {
  const wrapper = shallowMount(AssignItemsContextMenuItem, {
    localVue, listeners, propsData, store, stubs
  })

  wrapper.setData({ assigning: true })
  expect(wrapper).toMatchSnapshot()
})

describe('on assignment success', () => {
  const assignee = buildUserPayload({ id: 5 })

  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
  })

  it('dispatches store action', async () => {
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })

    const assignee = buildMembershipPayload({ user_id: 5 })
    await wrapper.find('member-selection-stub').vm.$emit('select', assignee)

    expect(store.dispatch).toHaveBeenCalledWith('dataset/assignItems', {
      assignee,
      dataset: propsData.dataset,
      filter: { dataset_item_ids: items.map(i => i.id) }
    })
  })

  it('deselects all items', async () => {
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })
    expect(store.state.dataset.selectedItemIds).toEqual(items.slice(0, 2).map(i => i.id))
    const assignee = buildUserPayload({ id: 5 })
    await wrapper.find('member-selection-stub').vm.$emit('select', assignee)
    await flushPromises()
    expect(store.state.dataset.selectedItemIds).toEqual([])
  })

  it('dispatches toast', async () => {
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })

    wrapper.find('member-selection-stub').vm.$emit('select', assignee)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
  })
})

describe('on assignment failure', () => {
  const assignee = buildUserPayload({ id: 5 })

  beforeEach(() => {
    const failure = { error: { message: 'Fake error' } }
    jest.spyOn(store, 'dispatch').mockResolvedValue(failure)
  })

  it('dispatches toast', async () => {
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })

    wrapper.find('member-selection-stub').vm.$emit('select', assignee)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })

  it(`shows storage dialog on ${outOfSubscribedStorageError.code}`, async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })

    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })

    wrapper.find('member-selection-stub').vm.$emit('select', assignee)
    await flushPromises()

    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })
})

describe('disable selected items for special cases', () => {
  it('disables when split video is selected', () => {
    const items = [
      buildDatasetItemPayload({
        id: 1,
        dataset_video_id: 1,
        dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: false })
      })
    ]
    store.commit('dataset/SET_DATASET_ITEMS', items)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })
    expect(wrapper.find('gallery-context-menu-item-stub').props('disabled')).toBeTruthy()
  })

  it('disables when processing items are selected', () => {
    const items = [buildDatasetItemPayload({ id: 1, status: DatasetItemStatus.processing })]
    store.commit('dataset/SET_DATASET_ITEMS', items)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })
    expect(wrapper.find('gallery-context-menu-item-stub').props('disabled')).toBeTruthy()
  })

  it('disables when default template starts with unassignable stage', () => {
    mTemplate = initializeMTemplate(sfh)
    sfh.default_workflow_template_id = mTemplate.id
    store.commit('dataset/PUSH_DATASET', sfh)
    store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', mTemplate)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
    const wrapper = shallowMount(AssignItemsContextMenuItem, {
      localVue, listeners, propsData, store, stubs
    })
    expect(wrapper.find('gallery-context-menu-item-stub').props('disabled')).toBeTruthy()
  })
})
