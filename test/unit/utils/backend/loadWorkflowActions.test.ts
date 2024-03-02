import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { loadWorkflowActions } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('loadWorkflowActions', () => {
  it('requests to correct path', async () => {
    await loadWorkflowActions({ datasetItemId: 1 })
    expect(api.get).toHaveBeenCalledWith('dataset_items/1/workflow_actions')
  })

  it('returns data', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await loadWorkflowActions({ datasetItemId: 1 })
    expect(response).toEqual(expect.objectContaining({ data: 'foo' }))
  })

  it('returns error', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)
    const response = await loadWorkflowActions({ datasetItemId: 1 })
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
