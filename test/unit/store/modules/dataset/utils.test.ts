import { buildDatasetItemPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { itemHasWorkflow, allItemsHaveWorkflows, allItemsNotNew } from '@/store/modules/dataset/utils'
import { DatasetItemStatus } from '@/store/types'

it('returns false if no workflow', () => {
  const item = buildDatasetItemPayload({ id: 1 })
  expect(itemHasWorkflow(item)).toBe(false)
})

it('returns false if there is a workflow', () => {
  const item = initializeARWorkflow({ id: 1 })
  expect(itemHasWorkflow(item)).toBe(true)
})

describe('allItemsHaveWorkflows', () => {
  it('returns false if no workflow on all items', () => {
    const items = [
      buildDatasetItemPayload({ id: 1 }),
      buildDatasetItemPayload({ id: 2 })
    ]
    expect(allItemsHaveWorkflows(items)).toBe(false)
  })

  it('returns false if no workflow on some items', () => {
    const items = [
      buildDatasetItemPayload({ id: 1 }),
      initializeARWorkflow({ id: 2 })
    ]
    expect(allItemsHaveWorkflows(items)).toBe(false)
  })

  it('returns true if every item has a workflow', () => {
    const items = [
      initializeARWorkflow({ id: 1 }),
      initializeARWorkflow({ id: 2 })
    ]
    expect(allItemsHaveWorkflows(items)).toBe(true)
  })
})

describe('allItemsNotNew', () => {
  it('returns false if all items are new', () => {
    const items = [
      buildDatasetItemPayload({ id: 1 }),
      buildDatasetItemPayload({ id: 2 })
    ]
    expect(allItemsNotNew(items)).toBe(false)
  })

  it('returns false if some items are new', () => {
    const items = [
      buildDatasetItemPayload({ id: 1 }),
      buildDatasetItemPayload({ id: 2, status: DatasetItemStatus.annotate })
    ]
    expect(allItemsNotNew(items)).toBe(false)
  })

  it('returns true if no new items', () => {
    const items = [
      initializeARWorkflow({ id: 1, status: DatasetItemStatus.annotate }),
      initializeARWorkflow({ id: 2, status: DatasetItemStatus.annotate })
    ]
    expect(allItemsNotNew(items)).toBe(true)
  })
})
