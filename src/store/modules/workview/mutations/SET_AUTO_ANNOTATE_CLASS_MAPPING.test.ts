import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { Mock } from 'test/unit/utils/storageMocks'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
  localStorage.setItem('class-mapping', '')

  store = createTestStore()
})

const MUTATION = 'workview/SET_AUTO_ANNOTATE_CLASS_MAPPING'

it('calls localStorage.setItem', () => {
  store.commit(MUTATION, {
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
  const expectedJSON = JSON.stringify({
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
  expect(localStorage.getItem('class-mapping')).toEqual(expectedJSON)
})

it('pushes new class mapping', () => {
  store.commit(MUTATION, {
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
  store.commit(MUTATION, {
    runningSessionId: 'test-2',
    classMapping: [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  })
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
    ],
    'test-2': [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  })
})

it('replaces existing mapping', () => {
  store.commit(MUTATION, {
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
  store.commit(MUTATION, {
    runningSessionId: 'test',
    classMapping: [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  })
  expect(store.state.workview.classMapping).toEqual({
    test: [
      {
        annotationClassId: 3,
        modelClassLabel: 'class-3'
      }
    ]
  })
})
