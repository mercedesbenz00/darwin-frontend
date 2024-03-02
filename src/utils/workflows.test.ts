import { buildV2WorkflowStagePayload } from 'test/unit/factories/buildV2WorkflowStagePayload'

import { StageType } from '@/store/types'
import { getStagesPath } from '@/utils/workflows'

describe('getStagesPath', () => {
  it('should return basic path', () => {
    const stages = [
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '111',
            target_stage_id: '222'
          }
        ],
        id: '111',
        name: 'Dataset',
        type: StageType.Dataset
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '222',
            target_stage_id: '333'
          }
        ],
        id: '222',
        name: 'Annotate',
        type: StageType.Annotate
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'reject',
            source_stage_id: '333',
            target_stage_id: '222'
          },
          {
            id: '',
            name: 'approve',
            source_stage_id: '333',
            target_stage_id: '444'
          }
        ],
        id: '333',
        name: 'Review',
        type: StageType.Review
      }),
      buildV2WorkflowStagePayload({
        edges: [],
        id: '444',
        name: 'Complete',
        type: StageType.Complete
      })
    ]
    const result = getStagesPath(stages)
    expect(
      result.map(s => s.name)
    ).toEqual(
      ['Dataset', 'Annotate', 'Review', 'Complete']
    )
  })

  it('should return path with accepted and rejected routes', () => {
    const stages = [
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '444',
            target_stage_id: '666'
          }
        ],
        id: '444',
        name: 'Annotate final',
        type: StageType.Annotate
      }),
      buildV2WorkflowStagePayload({
        edges: [],
        id: '666',
        name: 'Complete',
        type: StageType.Complete
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'reject',
            source_stage_id: '333',
            target_stage_id: '555'
          },
          {
            id: '',
            name: 'approve',
            source_stage_id: '333',
            target_stage_id: '444'
          }
        ],
        id: '333',
        name: 'Review',
        type: StageType.Review
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '222',
            target_stage_id: '333'
          }
        ],
        id: '222',
        name: 'Annotate',
        type: StageType.Annotate
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '111',
            target_stage_id: '222'
          }
        ],
        id: '111',
        name: 'Dataset',
        type: StageType.Dataset
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '555',
            target_stage_id: '333'
          }
        ],
        id: '555',
        name: 'Annotate backup',
        type: StageType.Annotate
      })
    ]
    const result = getStagesPath(stages)
    expect(
      result.map(s => s.name)
    ).toEqual(
      ['Dataset', 'Annotate', 'Review', 'Annotate final', 'Annotate backup', 'Complete']
    )
  })

  it('should not hang in endless recursion when unhappy path exists', () => {
    const stages = [
      buildV2WorkflowStagePayload({
        edges: [],
        id: '',
        name: 'Discard',
        type: StageType.Discard
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '111',
            target_stage_id: '222'
          }
        ],
        id: '111',
        name: 'Dataset',
        type: StageType.Dataset
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '222',
            target_stage_id: '333'
          }
        ],
        id: '222',
        name: 'Annotate',
        type: StageType.Annotate
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'approve',
            source_stage_id: '333',
            target_stage_id: '222'
          },
          {
            id: '',
            name: 'reject',
            source_stage_id: '333',
            target_stage_id: '444'
          }
        ],
        id: '333',
        name: 'Review',
        type: StageType.Review
      }),
      buildV2WorkflowStagePayload({
        edges: [],
        id: '444',
        name: 'Complete',
        type: StageType.Complete
      })
    ]

    const result = getStagesPath(stages)
    expect(
      result.map(s => s.name)
    ).toEqual(
      ['Dataset', 'Annotate', 'Review', 'Complete']
    )
  })

  it('does not render complete stage two times', () => {
    const stages = [
      buildV2WorkflowStagePayload({
        edges: [],
        id: '',
        name: 'Discard',
        type: StageType.Discard
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '111',
            target_stage_id: '222'
          }
        ],
        id: '111',
        name: 'Dataset',
        type: StageType.Dataset
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'default',
            source_stage_id: '222',
            target_stage_id: '333'
          }
        ],
        id: '222',
        name: 'Annotate',
        type: StageType.Annotate
      }),
      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'approve',
            source_stage_id: '333',
            target_stage_id: '555'
          },
          {
            id: '',
            name: 'reject',
            source_stage_id: '333',
            target_stage_id: '444'
          }
        ],
        id: '333',
        name: 'Review',
        type: StageType.Review
      }),

      buildV2WorkflowStagePayload({
        edges: [
          {
            id: '',
            name: 'approve',
            source_stage_id: '444',
            target_stage_id: '333'
          },
          {
            id: '',
            name: 'reject',
            source_stage_id: '444',
            target_stage_id: '555'
          }
        ],
        id: '444',
        name: 'Review Two',
        type: StageType.Review
      }),
      buildV2WorkflowStagePayload({
        edges: [],
        id: '555',
        name: 'Complete',
        type: StageType.Complete
      })
    ]

    const result = getStagesPath(stages)
    expect(
      result.map(s => s.name)
    ).toEqual(
      ['Dataset', 'Annotate', 'Review', 'Review Two', 'Complete']
    )
  })
})
