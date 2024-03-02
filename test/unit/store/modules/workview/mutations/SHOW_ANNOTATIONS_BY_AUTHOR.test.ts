import { getInitialState as workviewState } from '@/store/modules/workview'
import { SHOW_ANNOTATIONS_BY_AUTHOR } from '@/store/modules/workview/mutations/SHOW_ANNOTATIONS_BY_AUTHOR'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState

beforeEach(() => { state = workviewState() })

describe('SHOW_ANNOTATIONS_BY_AUTHOR', () => {
  it('updates hiddenAuthorsMap by userId', () => {
    SHOW_ANNOTATIONS_BY_AUTHOR(state, 1)
    expect(state.hiddenAuthorsMap[1]).toBeFalsy()
  })
})
