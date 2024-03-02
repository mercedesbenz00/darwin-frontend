import { buildAnnotationTypePayload } from 'test/unit/factories'

import { getInitialState as aclassState } from '@/store/modules/aclass'
import { SET_TYPES } from '@/store/modules/aclass/mutations/SET_TYPES'
import { AClassState } from '@/store/modules/aclass/state'

let state: AClassState

beforeEach(() => { state = aclassState() })

describe('SET_TYPES', () => {
  it('updates annotationOverlayDisabled', () => {
    const annotationTypes = [buildAnnotationTypePayload()]
    SET_TYPES(state, annotationTypes)
    expect(state.types).toEqual(annotationTypes)
  })
})
