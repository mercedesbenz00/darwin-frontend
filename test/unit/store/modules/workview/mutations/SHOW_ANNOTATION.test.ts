import { buildStageAnnotation } from 'test/unit/factories'

import { getInitialState as workviewState } from '@/store/modules/workview'
import { SHOW_ANNOTATION } from '@/store/modules/workview/mutations/SHOW_ANNOTATION'
import { WorkviewState } from '@/store/modules/workview/state'
import { StageAnnotation } from '@/store/modules/workview/types'

let state: WorkviewState
let stageAnnotation1: StageAnnotation
let stageAnnotation2: StageAnnotation

beforeEach(() => {
  state = workviewState()
  stageAnnotation1 = buildStageAnnotation({ id: '1' })
  stageAnnotation2 = buildStageAnnotation({ id: '2', isSelected: true })
  state.stageAnnotations = [stageAnnotation1, stageAnnotation2]
})

describe('SHOW_ANNOTATION', () => {
  it('updates isVisible to false', () => {
    SHOW_ANNOTATION(state, stageAnnotation2.id)
    expect(stageAnnotation2.isVisible).toBeTruthy()
  })
})
