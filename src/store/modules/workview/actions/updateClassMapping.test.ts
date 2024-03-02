import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { StoreActionPayload } from '@/store/types'

import { updateClassMapping } from './updateClassMapping'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('workview/SET_AUTO_ANNOTATE_CLASS_MAPPING', {
    runningSessionId: 'test',
    classMapping: [
      {
        annotationClassId: 1,
        modelClassLabel: 'class-1'
      },
      {
        annotationClassId: 2,
        modelClassLabel: 'class-2'
      }
    ]
  })
})

const ACTION = 'workview/updateClassMapping'

it('returns void', async () => {
  const payload: StoreActionPayload<typeof updateClassMapping> = {
    runningSessionId: 'test',
    classMapping: [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  }
  const result = await store.dispatch(ACTION, payload)
  expect(result).toEqual(undefined)
})

it('resets class mapping', async () => {
  expect(store.state.workview.classMapping).toEqual({
    test: [
      {
        annotationClassId: 1,
        modelClassLabel: 'class-1'
      },
      {
        annotationClassId: 2,
        modelClassLabel: 'class-2'
      }
    ]
  })

  const payload: StoreActionPayload<typeof updateClassMapping> = {
    runningSessionId: 'test',
    classMapping: [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  }

  await store.dispatch(ACTION, payload)

  expect(store.state.workview.classMapping).toEqual({
    test: [{
      annotationClassId: 3,
      modelClassLabel: 'class-3'
    }]
  })
})
