import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetItemTimeSummaryPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildDatasetItemPayload,
  buildUserPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildWorkflowStagePayload,
  buildWorkflowActionPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import { StageAnnotation } from '@/store/modules/workview/types'
import {
  ApiResponse,
  DatasetPayload,
  LoadingStatus,
  RESET_ZOOM_MODE
} from '@/store/types'
import { errorsByCode } from '@/utils'
import * as api from '@/utils/api'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

mockApi()

describe('workview/resetStageReviewStatus', () => {
  const stage = buildWorkflowStagePayload({ id: 5 })
  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/resetStageReviewStatus', stage)
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/skipStage', () => {
  const stage = buildWorkflowStagePayload({ id: 5 })
  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/skipStage', { stage, reason: 'Random' })
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/loadDataset', () => {
  const sfh = buildDatasetPayload({ id: 1, name: 'SFH' })
  const apiResponse: ApiResponse<DatasetPayload> = { data: sfh }

  const idParams = { datasetId: 1 }
  const slugParams = { datasetSlug: 'sfh', teamSlug: 'v7' }

  beforeEach(() => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse(apiResponse))
  })

  it('sends correct backend request by id', async () => {
    await store.dispatch('workview/loadDataset', idParams)
    expect(api.get).toHaveBeenCalledWith('datasets/1')
  })

  it('sends correct backend request by slug', async () => {
    await store.dispatch('workview/loadDataset', slugParams)
    expect(api.get).toHaveBeenCalledWith('v7/sfh')
  })

  it('sends request to tutorial backend', async () => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
    jest.spyOn(tutorialBackend, 'loadDataset')
    await store.dispatch('workview/loadDataset', idParams)
    expect(tutorialBackend.loadDataset).toHaveBeenCalledWith()
  })

  it('returns raw data', async () => {
    const { data } = await store.dispatch('workview/loadDataset', idParams)
    expect(data).toEqual(apiResponse.data)
  })

  it('pushes raw data to store', async () => {
    await store.dispatch('workview/loadDataset', idParams)
    expect(store.state.workview.dataset).toEqual(apiResponse.data)
  })

  it('responds with parsed error on failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('workview/loadDataset', idParams)
    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.DATASET_LOAD_NOT_AUTHORIZED
      })
    )
  })
})

describe('workview/copyStageAnnotations', () => {
  const fromStage = buildWorkflowStagePayload({})
  const toStage = buildWorkflowStagePayload({})
  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/copyStageAnnotations', { toStage, fromStage })
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/deleteAllVisibleStageAnnotations', () => {
  const stage = buildWorkflowStagePayload({ id: 1 })
  const annotation = buildStageAnnotationPayload({ workflow_stage_id: 1 })

  beforeEach(() => {
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })
  })

  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/deleteAllVisibleStageAnnotations')
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/deleteStageAnnotations', () => {
  const stage = buildWorkflowStagePayload({ id: 1 })
  const annotation = buildStageAnnotationPayload({ workflow_stage_id: 1 })

  beforeEach(() => {
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })
  })

  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/deleteStageAnnotations', [annotation])
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/updateStageAnnotationZIndex', () => {
  const joe = buildUserPayload({ id: 1 })
  const v7 = buildTeamPayload({ id: 9 })
  const membership = buildMembershipPayload({ id: 1, user_id: joe.id, team_id: v7.id })
  const item = initializeARWorkflow({ id: 5 })
  item.current_workflow!.stages[1][0].assignee_id = joe.id

  const payload = buildStageAnnotationPayload({
    id: 'fake-id', data: { polygon: { path: [{ x: 1, y: 2 }] } }
  })

  let annotation: StageAnnotation

  beforeEach(() => {
    store.commit('workview/PUSH_STAGE_ANNOTATION', payload)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])
    store.commit('user/SET_PROFILE', joe)
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('team/SET_MEMBERSHIPS', [membership])
    annotation = store.state.workview.stageAnnotations[0]
  })

  it('returns parsed error on failure', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)

    const { error } =
      await store.dispatch('workview/updateStageAnnotationZIndex', { annotation, zIndex: 9 })

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.DATASET_IMAGE_ANNOTATE
      })
    )
  })

  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const { error } =
      await store.dispatch('workview/updateStageAnnotationZIndex', { annotation, zIndex: 9 })
    expect(store.state.workview.error).toEqual(error)
  })
})

describe('workview/loadWorkflowActions', () => {
  const item = buildDatasetItemPayload({ id: 5 })
  const actions = [
    buildWorkflowActionPayload({ id: 1 }),
    buildWorkflowActionPayload({ id: 2 })
  ]
  beforeEach(() => {
    jest.spyOn(backend, 'loadWorkflowActions').mockResolvedValue(buildAxiosResponse({ data: actions }))
  })

  it('runs correctly on tutorial', async () => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
    expect(store.state.workview.workflowActions).toEqual([])
    const response = await store.dispatch('workview/loadWorkflowActions', item)
    expect(response).toEqual({ data: [] })
    expect(backend.loadWorkflowActions).not.toHaveBeenCalled()
    expect(store.state.workview.workflowActions).toEqual([{ datasetItemId: 5, actions: [] }])
  })

  it('runs correctly with backend', async () => {
    expect(store.state.workview.workflowActions).toEqual([])
    const response = await store.dispatch('workview/loadWorkflowActions', item)
    expect(backend.loadWorkflowActions).toHaveBeenCalledWith({ datasetItemId: 5 })
    expect(response.data).toEqual(actions)
    expect(store.state.workview.workflowActions).toEqual([{ datasetItemId: 5, actions }])
  })

  it('handles backend error response', async () => {
    jest.spyOn(backend, 'loadWorkflowActions').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
    const response = await store.dispatch('workview/loadWorkflowActions', item)
    expect(response.error).toEqual({ message: 'foo', isValidationError: false })
    expect(store.state.workview.workflowActions).toEqual([])
  })
})

describe('workview/SET_TOOL_ANNOTATION_TYPES', () => {
  it('sets toolAnnotationTypes', () => {
    expect(store.state.workview.toolAnnotationTypes).toEqual([])

    store.commit('workview/SET_TOOL_ANNOTATION_TYPES', ['polygon'])
    expect(store.state.workview.toolAnnotationTypes).toEqual(['polygon'])

    store.commit('workview/SET_TOOL_ANNOTATION_TYPES', [])
    expect(store.state.workview.toolAnnotationTypes).toEqual([])
  })
})

describe('workview/SET_CURRENT_TOOL', () => {
  it('sets currentTool', () => {
    expect(store.state.workview.currentTool).toEqual(null)

    store.commit('workview/SET_CURRENT_TOOL', 'polygon')
    expect(store.state.workview.currentTool).toEqual('polygon')

    store.commit('workview/SET_CURRENT_TOOL')
    expect(store.state.workview.currentTool).toEqual(null)
  })

  it('sets preselectedAnnotationClassId when currentTool type found in preselectedAnnotationClassIds', () => {
    store.state.workview.preselectedAnnotationClassIds = { polygon: 2, bounding_box: 5 }

    store.commit('workview/SET_CURRENT_TOOL', 'polygon')
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(2)

    store.commit('workview/SET_CURRENT_TOOL', 'bounding_box')
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(5)

    // unsetting tool does not unset class
    store.commit('workview/SET_CURRENT_TOOL', null)
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(null)
  })
})

describe('workview/PRESELECT_CLASS_ID', () => {
  it('does not set preselectedAnnotationClassId/s when no currentTool', () => {
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(null)

    store.commit('workview/PRESELECT_CLASS_ID', 2)
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(2)

    store.commit('workview/PRESELECT_CLASS_ID', 3)
    expect(store.state.workview.preselectedAnnotationClassId).toEqual(3)
  })
})

describe('workview/PRESELECT_CLASS_ID_FOR_TOOL', () => {
  it('does not set preselectedAnnotationClassId/s when no currentTool', () => {
    expect(store.state.workview.preselectedAnnotationClassIds).toEqual({})

    store.commit('workview/PRESELECT_CLASS_ID_FOR_TOOL', { tool: 'foo', classId: 1 })
    expect(store.state.workview.preselectedAnnotationClassIds).toEqual({ foo: 1 })

    store.commit('workview/PRESELECT_CLASS_ID_FOR_TOOL', { tool: 'bar', classId: 3 })
    expect(store.state.workview.preselectedAnnotationClassIds).toEqual({ foo: 1, bar: 3 })

    store.commit('workview/PRESELECT_CLASS_ID_FOR_TOOL', { tool: 'foo', classId: 4 })
    expect(store.state.workview.preselectedAnnotationClassIds).toEqual({ foo: 4, bar: 3 })
  })
})

describe('workview/SET_SEQUENCES', () => {
  it('sets new sequences', () => {
    expect(store.state.workview.sequences).toEqual([])
    store.commit('workview/SET_SEQUENCES', [1, 2])
    expect(store.state.workview.sequences).toEqual([1, 2])
  })

  it('replaces existing sequences', () => {
    store.commit('workview/SET_SEQUENCES', [1, 2])
    expect(store.state.workview.sequences).toEqual([1, 2])
    store.commit('workview/SET_SEQUENCES', [3, 4])
    expect(store.state.workview.sequences).toEqual([3, 4])
  })
})

describe('workview/SET_RESET_ZOOM_MODE', () => {
  it('sets reset zoom mode', () => {
    expect(store.state.workview.resetZoomMode).toBe(RESET_ZOOM_MODE.RESET)
    store.commit('workview/SET_RESET_ZOOM_MODE', RESET_ZOOM_MODE.FIXED)
    expect(store.state.workview.resetZoomMode).toBe(RESET_ZOOM_MODE.FIXED)
  })
})

describe('workview/PUSH_TIME_SUMMARY', () => {
  const summary1 = buildDatasetItemTimeSummaryPayload({ dataset_item_id: 1 })
  const summary2 = buildDatasetItemTimeSummaryPayload({ dataset_item_id: 2 })
  const summary3 = buildDatasetItemTimeSummaryPayload({ dataset_item_id: 3 })

  it('pushes new summary', () => {
    store.commit('workview/PUSH_TIME_SUMMARY', summary1)
    expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary1])
    store.commit('workview/PUSH_TIME_SUMMARY', summary2)
    expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary1, summary2])
  })

  it('replaces existing summary', () => {
    store.commit('workview/PUSH_TIME_SUMMARY', summary3)
    expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary3])
    store.commit('workview/PUSH_TIME_SUMMARY', summary3)
    expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary3])
    store.commit('workview/PUSH_TIME_SUMMARY', summary2)
    expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary3, summary2])
  })
})

describe('workview/getters/nextDatasetItem', () => {
  const item1 = buildDatasetItemPayload({ id: 11, seq: 1, dataset_image_id: 1 })
  const item2 = buildDatasetItemPayload({ id: 12, seq: 2, dataset_image_id: 2 })
  const item3 = buildDatasetItemPayload({ id: 13, seq: 4, dataset_image_id: 3 })
  const item4 = buildDatasetItemPayload({ id: 14, seq: 5, dataset_video_id: 1, dataset_image_id: 4 })
  const item5 = buildDatasetItemPayload({ id: 15, seq: 6, dataset_video_id: 1, dataset_image_id: 5 })
  const item6 = buildDatasetItemPayload({ id: 16, seq: 7, dataset_video_id: 1, dataset_image_id: 6 })
  const item7 = buildDatasetItemPayload({ id: 17, seq: 8, dataset_video_id: 1, dataset_image_id: 7 })

  it('gets next item, by seq', () => {
    store.commit('workview/PUSH_DATASET_ITEMS', [item3, item5, item4, item2, item7, item6, item1])
    expect(store.getters['workview/nextDatasetItem']).toBe(null)

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item3)
    expect(store.getters['workview/nextDatasetItem']).toBe(item5)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item5)
    expect(store.getters['workview/nextDatasetItem']).toBe(item4)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item4)
    expect(store.getters['workview/nextDatasetItem']).toBe(item2)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item2)
    expect(store.getters['workview/nextDatasetItem']).toBe(item7)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item7)
    expect(store.getters['workview/nextDatasetItem']).toBe(item6)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item6)
    expect(store.getters['workview/nextDatasetItem']).toBe(item1)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item1)
    expect(store.getters['workview/nextDatasetItem']).toBe(null)
  })
})

describe('workview/SET_WORKFLOW_ACTIONS', () => {
  const item1 = buildDatasetItemPayload({ id: 5 })
  const item2 = buildDatasetItemPayload({ id: 6 })

  const action1 = buildWorkflowActionPayload({ id: 1 })
  const action2 = buildWorkflowActionPayload({ id: 2 })
  const action3 = buildWorkflowActionPayload({ id: 3 })

  it('sets actions for item', () => {
    expect(store.state.workview.workflowActions).toEqual([])
    store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem: item1, actions: [action1, action2] })
    store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem: item2, actions: [action3] })
    expect(store.state.workview.workflowActions).toEqual([
      { datasetItemId: 5, actions: [action1, action2] },
      { datasetItemId: 6, actions: [action3] }
    ])
  })

  it('overwrites previous actions', () => {
    expect(store.state.workview.workflowActions).toEqual([])
    store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem: item1, actions: [action1, action2] })
    store.commit('workview/SET_WORKFLOW_ACTIONS', { datasetItem: item1, actions: [action3] })
    expect(store.state.workview.workflowActions).toEqual([
      { datasetItemId: 5, actions: [action3] }
    ])
  })
})

describe('workview/SET_WORKFLOW_ACTIONS_LOADING', () => {
  it('sets the loading status properly', () => {
    expect(store.state.workview.workflowActionsLoading).toEqual(LoadingStatus.Unloaded)
    store.commit('workview/SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loading)
    expect(store.state.workview.workflowActionsLoading).toEqual(LoadingStatus.Loading)
    store.commit('workview/SET_WORKFLOW_ACTIONS_LOADING', LoadingStatus.Loaded)
    expect(store.state.workview.workflowActionsLoading).toEqual(LoadingStatus.Loaded)
  })
})

describe('workview/REMOVE_STAGE_ANNOTATIONS', () => {
  it('remove stage annotations', () => {
    store.commit(
      'workview/SET_STAGE_ANNOTATIONS',
      {
        annotations: [
          buildStageAnnotationPayload({ id: 'first-stage' }),
          buildStageAnnotationPayload({ id: 'second-stage' }),
          buildStageAnnotationPayload({ id: 'third-stage' })
        ]
      }
    )

    const { stageAnnotations } = store.state.workview
    store.commit('workview/REMOVE_STAGE_ANNOTATIONS', [stageAnnotations[0], stageAnnotations[1]])

    expect(store.state.workview.stageAnnotations).toHaveLength(1)
  })
})

describe('workview/SET_CLICKER_EPSILON', () => {
  it('set clicker epsilon', () => {
    expect(store.state.workview.clickerEpsilon).toBe(0.5)
    store.commit('workview/SET_CLICKER_EPSILON', 4.5)
    expect(store.state.workview.clickerEpsilon).toBe(4.5)
  })
})

describe('workview/SET_VIDEO_ANNOTATION_DURATION', () => {
  it('sets video annotation duration', () => {
    expect(store.state.workview.videoAnnotationDuration).toBe(30)
    store.commit('workview/SET_VIDEO_ANNOTATION_DURATION', 50)
    expect(store.state.workview.videoAnnotationDuration).toBe(50)
  })
})
