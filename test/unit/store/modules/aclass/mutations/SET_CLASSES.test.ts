import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'aclass/SET_CLASSES'

it('sets classes', () => {
  const classes = [
    buildAnnotationClassPayload({ id: 1 }),
    buildAnnotationClassPayload({ id: 2 })
  ]
  store.commit(MUTATION, classes)

  expect(store.state.aclass.classes).toEqual(classes)
  expect(store.state.aclass.classesById).toEqual({
    1: classes[0],
    2: classes[1]
  })
})

it('replaces existing classes', () => {
  const classes = [
    buildAnnotationClassPayload({ id: 1 }),
    buildAnnotationClassPayload({ id: 2 })
  ]
  const classes2 = [
    buildAnnotationClassPayload({ id: 10 }),
    buildAnnotationClassPayload({ id: 20 })
  ]
  store.commit(MUTATION, classes)
  store.commit(MUTATION, classes2)

  expect(store.state.aclass.classes).toEqual(classes2)
  expect(store.state.aclass.classesById).toEqual({
    10: classes2[0],
    20: classes2[1]
  })
})
