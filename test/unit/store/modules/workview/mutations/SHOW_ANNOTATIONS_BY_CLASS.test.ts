import { getInitialState as workviewState } from '@/store/modules/workview'
import { SHOW_ANNOTATIONS_BY_CLASS } from '@/store/modules/workview/mutations/SHOW_ANNOTATIONS_BY_CLASS'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState

beforeEach(() => { state = workviewState() })

describe('SHOW_ANNOTATIONS_BY_CLASS', () => {
  it('updates hiddenClassesMap by classId', () => {
    SHOW_ANNOTATIONS_BY_CLASS(state, 1)
    expect(state.hiddenClassesMap[1]).toBeFalsy()
  })
})
