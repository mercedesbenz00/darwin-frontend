import { buildStageAnnotation } from 'test/unit/factories'

import { getInitialState as workviewState } from '@/store/modules/workview'
import { SELECT_ANNOTATION } from '@/store/modules/workview/mutations/SELECT_ANNOTATION'
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

describe('SELECT_ANNOTATION', () => {
  it('updates isSelected to true', () => {
    SELECT_ANNOTATION(state, stageAnnotation1.id)
    expect(stageAnnotation1.isSelected).toBeTruthy()
  })

  it('should deselect others', () => {
    SELECT_ANNOTATION(state, stageAnnotation1.id)
    expect(stageAnnotation1.isSelected).toBeTruthy()
    expect(stageAnnotation2.isSelected).toBeFalsy()
  })
})
