import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetItemPayload, buildDatasetPayload, buildParsedError } from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'

import { DatasetItemStatus } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ resetDatasetItems: jest.fn() }))

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
  jest.spyOn(backend, 'resetDatasetItems')
    .mockResolvedValue(buildAxiosResponse({ data: [] }))
})

const ACTION = 'dataset/resetSelectedItemsToNew'

it('throws if no selected items', () => {
  expect(store.dispatch(ACTION)).rejects.toThrow()
})

describe('when selected items have same workflow', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0], items[1]], selected: true })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.resetDatasetItems).toHaveBeenCalledWith({
      datasetId: 5,
      datasetItemIds: [1, 2],
      workflowStageTemplateId: 3
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
    const error = buildParsedError({ message: 'Foo' })
    jest.spyOn(backend, 'resetDatasetItems').mockResolvedValue(error)

    const result = await store.dispatch(ACTION)
    expect(result).toEqual(error)
  })
})

describe('when selected items have missing workflows', () => {
  beforeEach(() => {
    const items = [
      buildDatasetItemPayload({ id: 1, dataset_id: sfh.id }),
      buildDatasetItemPayload({ id: 2, dataset_id: sfh.id })
    ]
    store.commit('dataset/PUSH_DATASET_ITEMS', items)
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items, selected: true })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.resetDatasetItems).toHaveBeenCalled()
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result).toEqual({
      error: expect.objectContaining({ code: 'DATASET_ITEMS_MISSING_WORKFLOWS' })
    })
  })
})
