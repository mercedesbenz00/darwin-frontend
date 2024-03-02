import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetPayload } from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'

import { DatasetItemFilter, DatasetItemStatus } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ moveDatasetItemsToNew: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 5 })

const template = initializeARTemplate(sfh)
template.id = 111
template.workflow_stage_templates[0].id = 1
template.workflow_stage_templates[1].id = 2
template.workflow_stage_templates[2].id = 3

const template2 = initializeARTemplate()
template2.id = 222
template2.workflow_stage_templates[0].id = 4
template2.workflow_stage_templates[1].id = 5
template2.workflow_stage_templates[2].id = 6

const items = [
  initializeARWorkflow({ id: 1, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 2, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 3, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 4, dataset_id: sfh.id }, template2)
]

items[0].current_workflow!.current_stage_number = 1
items[0].current_workflow!.current_workflow_stage_template_id = 1
items[1].current_workflow!.current_stage_number = 1
items[1].current_workflow!.current_workflow_stage_template_id = 1
items[2].current_workflow!.current_stage_number = 2
items[2].current_workflow!.current_workflow_stage_template_id = 2
items[3].current_workflow!.current_stage_number = 1
items[3].current_workflow!.current_workflow_stage_template_id = 4

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', items)
  jest.spyOn(backend, 'moveDatasetItemsToNew').mockResolvedValue(
    buildAxiosResponse({ data: [] })
  )

  store.commit('dataset/UPDATE_ITEM_SELECTION', {
    items: [items[0], items[1]], selected: true
  })
})

const ACTION = 'dataset/moveSelectedItemsToNew'

it('returns error if no selected dataset', async () => {
  const result = await store.dispatch(ACTION)
  expect(result.error.code).toEqual('DATASET_NOT_SELECTED')
})

describe('when individual items selected', () => {
  beforeEach(() => {
    store.commit('dataset/SET_CURRENT_DATASET_ID', 5)
    store.commit('dataset/UPDATE_ITEM_SELECTION', {
      items: [items[0], items[1]], selected: true
    })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.moveDatasetItemsToNew).toHaveBeenCalledWith({
      datasetId: 5,
      filter: { dataset_item_ids: [1, 2] }
    })
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result.data).toEqual([])
  })

  it('updates status of selected items', async () => {
    await store.dispatch(ACTION)
    expect(store.state.dataset.datasetItems[0].status).toEqual(DatasetItemStatus.new)
    expect(store.state.dataset.datasetItems[1].status).toEqual(DatasetItemStatus.new)
    expect(store.state.dataset.datasetItems[2].status).not.toEqual(DatasetItemStatus.new)
  })

  it('returns backend error', async () => {
    const error = { error: { message: 'foo', isValidationError: false } }
    jest.spyOn(backend, 'moveDatasetItemsToNew').mockResolvedValue(error)

    const result = await store.dispatch(ACTION)
    expect(result).toEqual(error)
  })
})

describe('when selected all is active', () => {
  const filter: DatasetItemFilter = { statuses: [DatasetItemStatus.annotate] }

  beforeEach(() => {
    store.commit('dataset/SET_CURRENT_DATASET_ID', 5)
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.moveDatasetItemsToNew).toHaveBeenCalledWith({
      datasetId: 5,
      filter
    })
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result.data).toEqual([])
  })

  it('updates status of all items', async () => {
    await store.dispatch(ACTION)
    expect(store.state.dataset.datasetItems[0].status).toEqual(DatasetItemStatus.new)
    expect(store.state.dataset.datasetItems[1].status).toEqual(DatasetItemStatus.new)
    expect(store.state.dataset.datasetItems[2].status).toEqual(DatasetItemStatus.new)
  })

  it('returns backend error', async () => {
    const error = { error: { message: 'foo', isValidationError: false } }
    jest.spyOn(backend, 'moveDatasetItemsToNew').mockResolvedValue(error)

    const result = await store.dispatch(ACTION)
    expect(result).toEqual(error)
  })
})
