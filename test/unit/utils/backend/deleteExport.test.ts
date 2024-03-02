import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { deleteExport } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('deleteExport', () => {
  it('requests to correct path', async () => {
    await deleteExport({ datasetId: 1, name: 'test' })
    expect(api.remove).toHaveBeenCalledWith('datasets/1/exports/test')
  })

  it('returns data', async () => {
    jest.spyOn(api, 'remove').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await deleteExport({ datasetId: 1, name: 'test' })
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)
    const response = await deleteExport({ datasetId: 1, name: 'test' })
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
