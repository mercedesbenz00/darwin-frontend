import { getInitialState as workviewState } from '@/store/modules/workview'
import { HIDE_ANNOTATIONS_BY_CLASS } from '@/store/modules/workview/mutations/HIDE_ANNOTATIONS_BY_CLASS'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState

beforeEach(() => { state = workviewState() })

describe('HIDE_ANNOTATIONS_BY_CLASS', () => {
  it('updates hiddenClassesMap by userId', () => {
    HIDE_ANNOTATIONS_BY_CLASS(state, 1)
    expect(state.hiddenClassesMap[1]).toBeTruthy()
  })
})
