import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildStageAnnotation
} from 'test/unit/factories'

import { StageAnnotation } from '@/store/modules/workview/types'
import { updateStageAnnotation } from '@/utils/backend/updateStageAnnotation'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

jest.mock('@/utils/backend/updateStageAnnotation', () => ({
  updateStageAnnotation: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 200,
  })
}))

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})

  store = createUnstubbedTestStore()
  jest.spyOn(store, 'commit')

  const originDispatch = store.dispatch
  store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
    if (action === 'workview/resolveStageForSelectedItem') {
      return buildAxiosResponse({ data: {} })
    }
    return originDispatch(action, payload)
  })
})

describe('Update stage annotation', () => {
  beforeEach(() => {
    store.commit(
      'workview/PUSH_STAGE_ANNOTATION',
      buildStageAnnotation({ id: 'id', annotation_class_id: 1, workflow_stage_id: 1 })
    )
  })

  it('should has optimistic UI', async () => {
    const annotation = buildStageAnnotation({
      id: 'id',
      annotation_class_id: 4,
      workflow_stage_id: 3
    })

    const promise = store.dispatch('workview/updateStageAnnotation', annotation)
    expect(updateStageAnnotation).not.toHaveBeenCalled()
    expect(store.state.workview.stageAnnotations.find(i => i.id === 'id')).toEqual(annotation)

    await promise

    expect(updateStageAnnotation).toHaveBeenCalled()
    expect(store.state.workview.stageAnnotations.find(i => i.id === 'id')).toEqual(annotation)
  })
})

describe('[Edge Cases]', () => {
  it('server error should revert annotation update', async () => {
    (updateStageAnnotation as jest.Mock).mockResolvedValue({
      error: {
        code: '422',
        detail: null,
        message: 'Error',
        backendMessage: null,
        status: 422
      }
    })

    const annotation =
      buildStageAnnotation({ id: 'id' })
    store.commit(
      'workview/PUSH_STAGE_ANNOTATION',
      annotation
    )

    const annotationToUpdate = buildStageAnnotation({
      id: 'id',
      data: { bounding_box: { x: 30, y: 50, w: 100, h: 430 } }
    })
    const res = await store.dispatch('workview/updateStageAnnotation', annotationToUpdate)

    expect(store.state.workview.stageAnnotations.find(i => i.id === 'id')).toEqual(annotation)
    expect(!!res.error).toBeTruthy()
  })

  describe('update lost annotation', () => {
    let annotation: StageAnnotation

    beforeEach(() => {
      annotation = buildStageAnnotation({ id: 'id', isVisible: true })
    })

    it('should try to create annotation', async () => {
      const originDispatch = store.dispatch
      store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
        if (action === 'workview/createStageAnnotation') {
          return buildAxiosResponse({ data: annotation })
        }
        return originDispatch(action, payload)
      })

      try {
        await store.dispatch('workview/updateStageAnnotation', annotation)
        expect(store.dispatch)
          .toHaveBeenCalledWith('workview/createStageAnnotation', annotation)
      } catch (e: unknown) {
        expect((e as Error).message)
          .toBe("workview/updateStageAnnotation: Something went wrong! Can't get created annotation!")
      }
    })

    it('should push annotation back to the store if it is exists on the API side', async () => {
      const originDispatch = store.dispatch
      store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
        if (action === 'workview/createStageAnnotation') {
          return { error: { id: 'ID must be unique' } }
        }
        if (action === 'workview/resolveStageForSelectedItem') {
          return buildAxiosResponse({ data: { id: 1 }})
        }
        return originDispatch(action, payload)
      })

      await store.dispatch('workview/updateStageAnnotation', annotation)
      expect(store.commit).toHaveBeenCalledWith(
        'workview/PUSH_STAGE_ANNOTATION',
        annotation,
        undefined
      )
    })

    it("should return an error when it can't resolve unknown annotation update", () => {
      const originDispatch = store.dispatch
      store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
        if (action === 'workview/createStageAnnotation') {
          return { error: { message: 'unknown error' } }
        }
        return originDispatch(action, payload)
      })

      expect(store.dispatch('workview/updateStageAnnotation', annotation))
        .resolves
        .toEqual({error: {message: 'unknown error'}})
    })
  })
})
