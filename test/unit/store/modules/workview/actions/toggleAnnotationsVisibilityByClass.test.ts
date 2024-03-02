import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import { buildStageAnnotation } from 'test/unit/factories'

import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { StageAnnotation } from '@/store/modules/workview/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const nonTagAnnotationsMock = jest.fn()
const createGetterMockedStore = () => {
  const store = new Store({
    modules: {
      workview: {
        ...workview,
        getters: {
          ...workview.getters,
          selectedStageNonTagAnnotations: nonTagAnnotationsMock
        },
        state: workviewState()
      }
    }
  })
  return store
}

let store: ReturnType<typeof createGetterMockedStore>
let annotation1: StageAnnotation
let annotation2: StageAnnotation
let annotation3: StageAnnotation

beforeEach(() => {
  store = createGetterMockedStore()

  annotation1 = buildStageAnnotation({ annotation_class_id: 1, id: '1' })
  annotation2 = buildStageAnnotation({ annotation_class_id: 2, id: '2' })
  annotation3 = buildStageAnnotation({ annotation_class_id: 3, id: '3' })

  nonTagAnnotationsMock.mockReturnValue([annotation1, annotation2, annotation3])
})

it('hide annotations', async () => {
  const { commit } = store

  store.commit = jest.fn().mockImplementation((type: string, payload: any) => {
    if (type === 'workview/UPDATE_ANNOTATIONS_VISIBILITY') {
      return {}
    }
    commit(type, payload)
  })

  await store.dispatch('workview/toggleAnnotationsVisibilityByClass', 1)
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    {
      annotationIds: [annotation1.id],
      visibility: false
    },
    undefined
  )
})

it('show annotations', async () => {
  const { commit } = store
  commit('workview/HIDE_ANNOTATIONS_BY_CLASS', 1)

  store.commit = jest.fn().mockImplementation((type: string, payload: any) => {
    if (type === 'workview/UPDATE_ANNOTATIONS_VISIBILITY') {
      return {}
    }
    commit(type, payload)
  })

  await store.dispatch('workview/toggleAnnotationsVisibilityByClass', 1)
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    {
      annotationIds: [annotation1.id],
      visibility: true
    },
    undefined
  )
})
