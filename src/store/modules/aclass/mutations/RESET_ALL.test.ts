import { buildAnnotationTypePayload } from 'test/unit/factories'

import { getInitialState } from '@/store/modules/aclass/state'
import { LoadingStatus } from '@/store/types'

import { RESET_ALL } from './RESET_ALL'

it('keeps types and typeLoadingStatus', () => {
  const state = getInitialState()
  const types = [
    buildAnnotationTypePayload({ id: 1 }),
    buildAnnotationTypePayload({ id: 2 })
  ]
  state.typesLoadingStatus = LoadingStatus.Loaded
  state.types = types

  RESET_ALL(state, undefined)
  expect(state.typesLoadingStatus).toEqual(LoadingStatus.Loaded)
  expect(state.types).toEqual(types)
})
