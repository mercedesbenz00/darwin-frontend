import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildMembershipPayload,
  buildStageAnnotationPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import { StageAnnotation } from '@/store/modules/workview/types'
import { api, errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}
const joe = buildUserPayload({ id: 1 })
const v7 = buildTeamPayload({ id: 9 })
const membership = buildMembershipPayload({ id: 1, user_id: joe.id, team_id: v7.id })
let store: ReturnType<typeof createUnstubbedTestStore>
const item = initializeARWorkflow({ id: 5 })
const stage = item.current_workflow!.stages[1][0]
stage.assignee_id = joe.id
const annotation = buildStageAnnotationPayload({ id: 'annotation-id', workflow_stage_id: stage.id })

const action = 'workview/deleteStageAnnotation'
let actionPayload: StageAnnotation

mockApi()

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [membership])
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })
  jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: annotation }))
  actionPayload = store.state.workview.stageAnnotations[0]
})

it('sends request', async () => {
  await store.dispatch(action, actionPayload)
  expect(api.remove)
    .toHaveBeenCalledWith(`workflow_stages/${stage.id}/annotations/annotation-id`)
})

it('updates data in store', async () => {
  await store.dispatch(action, actionPayload)
  expect(store.state.workview.stageAnnotations).toEqual([])
})

it('returns parsed error on self-assign stage failure', async () => {
  const item = initializeARWorkflow({ id: 5 })
  const stage = item.current_workflow!.stages[1][0]
  stage.assignee_id = null

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

  jest.spyOn(api, 'post').mockImplementation((path: string) => {
    if (path === `workflow_stages/${stage.id}/assign`) {
      return Promise.reject(unauthorizedError)
    }
    return Promise.resolve(buildAxiosResponse({ data: {} }))
  })

  const response = await store.dispatch(action, actionPayload)

  expect(response).toEqual({
    error: expect.objectContaining({ status: 401, message: expect.any(String) })
  })
})

it('returns parsed error on failure', async () => {
  jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)

  const { error } = await store.dispatch(action, actionPayload)

  expect(error).toEqual(
    expect.objectContaining({
      status: 401,
      message: errorsByCode.DATASET_IMAGE_ANNOTATE
    })
  )
})

it('sets parsed error to store', async () => {
  jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)
  const { error } = await store.dispatch(action, actionPayload)
  expect(store.state.workview.error).toEqual(error)
})
