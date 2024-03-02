import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildStageAnnotation } from 'test/unit/factories'
import { bottle, flask, scale } from 'test/unit/fixtures/annotation-class-payloads'

import { selectedStageActiveClassStats } from '@/store/modules/workview/getters/selectedStageActiveClassStats'
import { WorkviewState } from '@/store/modules/workview/state'
import { AnnotationClassStat, StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload, RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let state: WorkviewState
let getters: {
  nonTagAnnotationClasses: AnnotationClassPayload[]
  selectedStageNonTagAnnotations: StageAnnotation[]
}
let rootState: RootState
let rootGetters: any

beforeEach(() => {
  const store = createTestStore()
  state = store.state.workview
  rootState = store.state
  rootGetters = {}
})

describe('selectedStageActiveClassStats', () => {
  it('returns annotations stats for present annotation classes', () => {
    const annotation1 = buildStageAnnotation({ annotation_class_id: flask.id })
    const annotation2 = buildStageAnnotation({ annotation_class_id: scale.id })
    const annotation3 = buildStageAnnotation({ annotation_class_id: scale.id })

    state.hiddenClassesMap = {}
    getters = {
      nonTagAnnotationClasses: [bottle, flask, scale],
      selectedStageNonTagAnnotations: [annotation1, annotation2, annotation3]
    }

    const expectedStats: AnnotationClassStat[] = [
      { annotationClass: flask, count: 1 },
      { annotationClass: scale, count: 2 }
    ]
    expect(
      selectedStageActiveClassStats(state, getters, rootState, rootGetters)
    ).toEqual(expectedStats)
  })

  it('returns annotations stats for present and hidden annotation classes', () => {
    const annotation1 = buildStageAnnotation({ annotation_class_id: flask.id })
    const annotation2 = buildStageAnnotation({ annotation_class_id: scale.id })
    const annotation3 = buildStageAnnotation({ annotation_class_id: scale.id })

    state.hiddenClassesMap = { [bottle.id]: true }
    getters = {
      nonTagAnnotationClasses: [bottle, flask, scale],
      selectedStageNonTagAnnotations: [annotation1, annotation2, annotation3]
    }

    const expectedStats: AnnotationClassStat[] = [
      { annotationClass: flask, count: 1 },
      { annotationClass: bottle, count: 0 },
      { annotationClass: scale, count: 2 }
    ]
    expect(
      selectedStageActiveClassStats(state, getters, rootState, rootGetters)
    ).toEqual(expectedStats)
  })
})
