import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import { buildAnnotationActorPayload, buildStageAnnotation } from 'test/unit/factories'

import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationActorPayload } from '@/store/types'

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
let actor1: AnnotationActorPayload
let actor2: AnnotationActorPayload

beforeEach(() => {
  store = createGetterMockedStore()

  actor1 = buildAnnotationActorPayload({ user_id: 1 })
  actor2 = buildAnnotationActorPayload({ user_id: 2 })

  annotation1 = buildStageAnnotation({ actors: [actor1], annotation_class_id: 1, id: '1' })
  annotation2 = buildStageAnnotation({ actors: [actor2], annotation_class_id: 2, id: '2' })
  annotation3 = buildStageAnnotation({ actors: [actor2], annotation_class_id: 3, id: '3' })

  nonTagAnnotationsMock.mockReturnValue([annotation1, annotation2, annotation3])
})

it('everything will be visible when no author, no class is selected to hide', async () => {
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  await store.dispatch('workview/refreshAnnotationsVisibility')
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    { annotationIds: [], visibility: false },
    undefined
  )
})

it('hide annotations when one author, no class is selected to hide', async () => {
  store.commit('workview/HIDE_ANNOTATIONS_BY_AUTHOR', actor1.user_id)

  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  await store.dispatch('workview/refreshAnnotationsVisibility')
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    { annotationIds: [annotation1.id], visibility: false },
    undefined
  )
})

it('hide annotations when no author, one class is selected to hide', async () => {
  store.commit('workview/HIDE_ANNOTATIONS_BY_CLASS', annotation2.annotation_class_id)

  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  await store.dispatch('workview/refreshAnnotationsVisibility')
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    { annotationIds: [annotation2.id], visibility: false },
    undefined
  )
})

it('hide annotations when one author, one class is selected to hide', async () => {
  store.commit('workview/HIDE_ANNOTATIONS_BY_AUTHOR', actor2.user_id)
  store.commit('workview/HIDE_ANNOTATIONS_BY_CLASS', annotation1.annotation_class_id)

  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  await store.dispatch('workview/refreshAnnotationsVisibility')
  expect(store.commit).toHaveBeenCalledWith(
    'workview/UPDATE_ANNOTATIONS_VISIBILITY',
    {
      annotationIds: [annotation1.id, annotation2.id, annotation3.id],
      visibility: false
    },
    undefined
  )
})
