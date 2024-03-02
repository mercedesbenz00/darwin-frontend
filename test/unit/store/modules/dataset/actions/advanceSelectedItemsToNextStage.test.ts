import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetItemPayload, buildDatasetPayload, buildParsedError } from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ setDatasetItemsStage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 5 })

const template = initializeARTemplate(sfh)
template.id = 1
template.workflow_stage_templates[0].id = 11
template.workflow_stage_templates[1].id = 22
template.workflow_stage_templates[2].id = 33

const template2 = initializeARTemplate()
template2.id = 2
template2.workflow_stage_templates[0].id = 44
template2.workflow_stage_templates[1].id = 55
template2.workflow_stage_templates[2].id = 66

const items = [
  initializeARWorkflow({ id: 1, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 2, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 3, dataset_id: sfh.id }, template),
  initializeARWorkflow({ id: 4, dataset_id: sfh.id }, template2)
]

items[0].current_workflow!.current_stage_number = 1
items[0].current_workflow!.current_workflow_stage_template_id = 11
items[1].current_workflow!.current_stage_number = 1
items[1].current_workflow!.current_workflow_stage_template_id = 11
items[2].current_workflow!.current_stage_number = 2
items[2].current_workflow!.current_workflow_stage_template_id = 22
items[3].current_workflow!.current_stage_number = 1
items[3].current_workflow!.current_workflow_stage_template_id = 44

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', items)
  jest.spyOn(backend, 'setDatasetItemsStage')
    .mockResolvedValue(buildAxiosResponse({ data: [] }))
})

const ACTION = 'dataset/advanceSelectedItemsToNextStage'

it('throws if no selected items', () => {
  expect(store.dispatch(ACTION)).rejects.toThrow()
})

describe('when selected items have same workflow', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0], items[1]], selected: true })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.setDatasetItemsStage).toHaveBeenCalledWith({
      datasetId: 5,
      datasetItemIds: [1, 2],
      workflowStageTemplateId: 22
    })
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result.data).toEqual([])
  })

  it('returns backend error', async () => {
    const error = buildParsedError({ message: 'Foo' })
    jest.spyOn(backend, 'setDatasetItemsStage').mockResolvedValue(error)

    const result = await store.dispatch(ACTION)
    expect(result).toEqual(error)
  })
})

describe('when selected items have different workflows', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0], items[3]], selected: true })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.setDatasetItemsStage).toHaveBeenCalled()
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result).toEqual({
      error: expect.objectContaining({ code: 'DATASET_ITEMS_SELECTION_INVALID' })
    })
  })
})

describe('when selected items have workflows in different stages', () => {
  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [items[0], items[2]], selected: true })
  })

  it('calls correct API endpoint', async () => {
    await store.dispatch(ACTION)
    expect(backend.setDatasetItemsStage).toHaveBeenCalled()
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result).toEqual({
      error: expect.objectContaining({ code: 'DATASET_ITEMS_SELECTION_INVALID' })
    })
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
    expect(backend.setDatasetItemsStage).toHaveBeenCalled()
  })

  it('returns result', async () => {
    const result = await store.dispatch(ACTION)
    expect(result).toEqual({
      error: expect.objectContaining({ code: 'DATASET_ITEMS_MISSING_WORKFLOWS' })
    })
  })
})
