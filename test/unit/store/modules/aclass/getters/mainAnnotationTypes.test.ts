import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationTypePayload } from 'test/unit/factories'

import { mainAnnotationTypes } from '@/store/modules/aclass/getters/mainAnnotationTypes'
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

describe('mainAnnotationTypes', () => {
  it('returns main annotation types', () => {
    expect(mainAnnotationTypes(store.state.aclass, {}, rootState, rootGetters))
      .toEqual([annotationTypes[0]])
  })
})
