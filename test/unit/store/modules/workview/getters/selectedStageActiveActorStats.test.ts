import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationActorPayload, buildStageAnnotation } from 'test/unit/factories'

import { selectedStageActiveActorStats } from '@/store/modules/workview/getters/selectedStageActiveActorStats'
import { WorkviewState } from '@/store/modules/workview/state'
import { AnnotationActorStat, StageAnnotation } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: WorkviewState
let getters: { selectedStageNonTagAnnotations: StageAnnotation[] }
let rootState: RootState
let rootGetters: any

beforeEach(() => {
  const store = createTestStore()
  state = store.state.workview
  rootState = store.state
  rootGetters = {}
})

describe('selectedStageActiveActorStats', () => {
  it('returns annotations stats for present actors', () => {
    const actor1 = buildAnnotationActorPayload({ user_id: 1 })
    const actor2 = buildAnnotationActorPayload({ user_id: 2 })

    const annotation1 = buildStageAnnotation({ actors: [actor1] })
    const annotation2 = buildStageAnnotation({ actors: [actor1] })
    const annotation3 = buildStageAnnotation({ actors: [actor2] })

    getters = {
      selectedStageNonTagAnnotations: [annotation1, annotation2, annotation3]
    }

    const expectedStats: AnnotationActorStat[] = [
      { actor: actor1, count: 2 },
      { actor: actor2, count: 1 }
    ]
    expect(
      selectedStageActiveActorStats(state, getters, rootState, rootGetters)
    ).toEqual(expectedStats)
  })
})
