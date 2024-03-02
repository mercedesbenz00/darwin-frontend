import { mockApi } from 'test/unit/mocks/mockApi'

import * as api from '@/utils/api'
import { updateWorkflowStageTemplate } from '@/utils/backend'

mockApi()

const unauthorizedError = {
  response: { status: 401 }
}

describe('updateWorkflowStageTemplate', () => {
  const payload: Parameters<typeof updateWorkflowStageTemplate>[0] = {
    id: 1,
    metadata: {
      anyone: false,
      base_sampling_rate: 1,
      readonly: true,
      user_sampling_rate: 1
    },
    workflow_stage_template_assignees: []
  }
  it('requests to correct path', async () => {
    await updateWorkflowStageTemplate(payload)
    expect(api.put).toHaveBeenCalledWith('workflow_stage_templates/1', payload)
  })

  it('returns data', async () => {
    jest.spyOn(api, 'put').mockResolvedValue(expect.objectContaining({ data: 'foo' }))
    const response = await updateWorkflowStageTemplate(payload)
    expect(response).toEqual({ data: 'foo' })
  })

  it('returns error', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const response = await updateWorkflowStageTemplate(payload)
    expect(response).toEqual({ error: expect.objectContaining({ status: 401 }) })
  })
})
