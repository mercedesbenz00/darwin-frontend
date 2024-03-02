import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildStageAnnotationPayload,
  buildUserPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import { StageAnnotation } from '@/store/modules/workview/types'
import { StageAnnotationPayload } from '@/store/types'
import { constructError, errorsByCode } from '@/utils'
import * as api from '@/utils/api'
import { ErrorCodes } from '@/utils/error/errors'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

mockApi()

describe('workview/updateStageAnnotation', () => {
  const joe = buildUserPayload({ id: 1 })
  const v7 = buildTeamPayload({ id: 9 })
  const membership = buildMembershipPayload({ id: 1, user_id: joe.id, team_id: v7.id })
  const item = initializeARWorkflow({ id: 5 })
  item.current_workflow!.stages[1][0].assignee_id = joe.id

  const payload = buildStageAnnotationPayload({
    id: 'fake-id', data: { polygon: { path: [{ x: 1, y: 2 }] } }
  })

  let params: Partial<StageAnnotationPayload>

  let annotation: StageAnnotation

  beforeEach(() => {
    store.commit('workview/PUSH_STAGE_ANNOTATION', payload)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])
    store.commit('user/SET_PROFILE', joe)
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('team/SET_MEMBERSHIPS', [membership])
    annotation = store.state.workview.stageAnnotations[0]
    params = { ...annotation, annotation_class_id: 5 }
  })

  it('sends request', async () => {
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: params }))

    await store.dispatch('workview/updateStageAnnotation', params)
    expect(api.put).toHaveBeenCalledWith('workflow_stages/-1/annotations/fake-id', {
      annotation_class_id: 5,
      data: { polygon: { path: [{ x: 1, y: 2 }] } },
      z_index: 1
    }, { cancelToken: expect.anything() })
  })

  it('updates data in store', async () => {
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: params }))
    await store.dispatch('workview/updateStageAnnotation', params)
    expect(store.state.workview.stageAnnotations).toEqual([{ ...params }])
  })

  it('returns error if data is missing id', async () => {
    const response = await store.dispatch('workview/updateStageAnnotation', { ...params, id: undefined })
    expect(response).toEqual(constructError(ErrorCodes.UPDATING_ANNOTATION_WITHOUT_ID))
  })

  it('returns parsed error on failure', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('workview/updateStageAnnotation', params)

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.DATASET_IMAGE_ANNOTATE
      })
    )
  })

  it('sets parsed error to store', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const { error } = await store.dispatch('workview/updateStageAnnotation', params)
    expect(store.state.workview.error).toEqual(error)
  })
})
