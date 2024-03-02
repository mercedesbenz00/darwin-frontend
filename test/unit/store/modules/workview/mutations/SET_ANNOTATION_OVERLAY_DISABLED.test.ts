import { getInitialState as workviewState } from '@/store/modules/workview'
import { SET_ANNOTATION_OVERLAY_DISABLED } from '@/store/modules/workview/mutations/SET_ANNOTATION_OVERLAY_DISABLED'
import { WorkviewState } from '@/store/modules/workview/state'

let state: WorkviewState

beforeEach(() => { state = workviewState() })

describe('SET_ANNOTATION_OVERLAY_DISABLED', () => {
  it('updates annotationOverlayDisabled', () => {
    SET_ANNOTATION_OVERLAY_DISABLED(state, true)
    expect(state.annotationOverlayDisabled).toBeTruthy()
    SET_ANNOTATION_OVERLAY_DISABLED(state, false)
    expect(state.annotationOverlayDisabled).toBeFalsy()
  })
})
