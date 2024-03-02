import { getInitialState as workviewState } from '@/store/modules/workview'
import { HIDE_ANNOTATIONS_BY_AUTHOR } from '@/store/modules/workview/mutations/HIDE_ANNOTATIONS_BY_AUTHOR'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState

beforeEach(() => { state = workviewState() })

describe('HIDE_ANNOTATIONS_BY_AUTHOR', () => {
  it('updates hiddenAuthorsMap by userId', () => {
    HIDE_ANNOTATIONS_BY_AUTHOR(state, 1)
    expect(state.hiddenAuthorsMap[1]).toBeTruthy()
  })
})
