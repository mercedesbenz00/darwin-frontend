import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { flask, scale, tag } from 'test/unit/fixtures/annotation-class-payloads'

import { nonTagAnnotationClasses } from '@/store/modules/workview/getters/nonTagAnnotationClasses'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let rootState: RootState
const rootGetters = {}

let store: ReturnType<typeof createTestStore>
beforeEach(() => {
  store = createTestStore()
  store.state.aclass.classes = [flask, scale, tag]
  rootState = store.state
})

describe('nonTagAnnotationClasses', () => {
  it('returns the non-tag annotation classes', () => {
    expect(
      nonTagAnnotationClasses(store.state.workview, {}, rootState, rootGetters)
    ).toEqual([flask, scale])
  })
})
