import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'aclass/PUSH_CLASS'

let classes: AnnotationClassPayload[]
beforeEach(() => {
  classes = [
    buildAnnotationClassPayload({ id: 1 }),
    buildAnnotationClassPayload({ id: 2 })
  ]
  store.commit('aclass/SET_CLASSES', classes)
})

it('should push a new class', () => {
  const newClass = buildAnnotationClassPayload({ id: 3 })
  store.commit(MUTATION, newClass)
  expect(store.state.aclass.classes).toHaveLength(3)
  expect(store.state.aclass.classesById).toEqual({
    1: classes[0],
    2: classes[1],
    3: newClass
  })
})

it('should update existing class', () => {
  const newClass = buildAnnotationClassPayload({ id: 2 })
  store.commit(MUTATION, newClass)
  expect(store.state.aclass.classes).toHaveLength(2)
  expect(store.state.aclass.classesById).toEqual({
    1: classes[0],
    2: newClass
  })
})
