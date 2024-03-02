import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationTypePayload } from 'test/unit/factories'

import { subAnnotationTypes } from '@/store/modules/aclass/getters/subAnnotationTypes'
import { AnnotationTypePayload, RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let rootState: RootState
const rootGetters = {}

let store: ReturnType<typeof createTestStore>
let annotationTypes: AnnotationTypePayload[]

beforeEach(() => {
  store = createTestStore()
  annotationTypes = [
    buildAnnotationTypePayload({ id: 1, granularity: 'main' }),
    buildAnnotationTypePayload({ id: 2, granularity: 'sub' })
  ]
  store.commit('aclass/SET_TYPES', annotationTypes)
  rootState = store.state
})

describe('subAnnotationTypes', () => {
  it('returns sub annotation types', () => {
    expect(subAnnotationTypes(store.state.aclass, {}, rootState, rootGetters))
      .toEqual([annotationTypes[1]])
  })
})
