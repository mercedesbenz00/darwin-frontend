import { buildWorkflowStageTemplatePayload } from 'test/unit/factories'

import { groupStages } from '@/components/DatasetSettings/utils'
import { StageType } from '@/store/types'

describe('groupStages', () => {
  it('groups an A R workflow', () => {
    const annotate = buildWorkflowStageTemplatePayload({ type: StageType.Annotate })
    const review = buildWorkflowStageTemplatePayload({ type: StageType.Review })
    const complete = buildWorkflowStageTemplatePayload({ type: StageType.Complete })
    expect(groupStages([annotate, review, complete])).toEqual([[annotate], [review]])
  })

  it('groups a workflow containing a blind stage', () => {
    const annotate = buildWorkflowStageTemplatePayload({
      type: StageType.Annotate, metadata: { parallel: 2 }
    })
    const test = buildWorkflowStageTemplatePayload({ type: StageType.Test })
    const review = buildWorkflowStageTemplatePayload({ type: StageType.Review })
    const complete = buildWorkflowStageTemplatePayload({ type: StageType.Complete })
    expect(groupStages([annotate, test, review, complete])).toEqual([[annotate, test, review]])
  })
})
