import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import {
  buildAnnotationTypePayload,
  buildAxiosResponse,
  buildMembershipPayload,
  buildStageAnnotationPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import createStageAnnotation from '@/store/modules/workview/actions/createStageAnnotation'
import {
  StageAnnotationPayload,
  StoreActionPayload
} from '@/store/types'
import { api, errorsByCode } from '@/utils'

jest.mock('@/utils/wind', () => ({
  loadGustModels: jest.fn(),
  runInference: jest.fn()
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const unauthorizedError = {
  response: { status: 401 }
}

let store: ReturnType<typeof initializeStore>

const joe = buildUserPayload({ id: 1 })
const v7 = buildTeamPayload({ id: 9 })
const membership = buildMembershipPayload({ id: 1, user_id: joe.id, team_id: v7.id })
const item = initializeARWorkflow({ id: 5 })
const stage = item.current_workflow!.stages[1][0]
stage.assignee_id = joe.id

const annotationTypes = [
  buildAnnotationTypePayload({ id: 1, granularity: 'main' }),
  buildAnnotationTypePayload({ id: 2, granularity: 'sub' })
]

let payload: StoreActionPayload<typeof createStageAnnotation>
let response: StageAnnotationPayload

const action = 'workview/createStageAnnotation'

mockApi()

const createStore = () => {
  const store = initializeStore()
  const { dispatch } = store
  store.dispatch = jest.fn().mockImplementation((action: string, payload: any) => {
    if (action.startsWith('toast')) {
      return {}
    } else {
      return dispatch(action, payload)
    }
  })

  return store
}

beforeEach(() => {
  store = createStore()

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('aclass/SET_TYPES', annotationTypes)
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [membership])
  payload = {
    annotation_class_id: 5,
    data: {},
    z_index: 1,
    'annotation_group_id': null
  }
  response = buildStageAnnotationPayload({
    ...payload,
    id: 'fake-id',
    workflow_stage_id: stage.id,
  })
  jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: response }))
})

it('sends request', async () => {
  await store.dispatch(action, payload)
  expect(api.post).toHaveBeenCalledWith(`workflow_stages/${stage.id}/annotations`, {
    annotation_class_id: 5,
    data: { },
    z_index: 1
  })
})

it('updates data in store', async () => {
  await store.dispatch(action, payload)
  expect(store.state.workview.stageAnnotations).toEqual([expect.objectContaining(response)])
})

it('returns parsed error on self-assign stage failure', async () => {
  store.commit('workview/SET_SELECTED_DATASET_ITEM', {
    ...item,
    current_workflow: null,
    current_workflow_id: null
  })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)

  jest.spyOn(api, 'post').mockImplementation((path: string) => {
    if (path === `dataset_items/${item.id}/workflow`) { return Promise.reject(unauthorizedError) }
    return Promise.resolve(buildAxiosResponse({ data: {} }))
  })

  const { error } = await store.dispatch(action, payload)

  expect(error).toEqual(
    expect.objectContaining({ status: 401, message: expect.any(String) })
  )
})

it('returns parsed error on failure', async () => {
  jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

  const { error } = await store.dispatch(action, payload)

  expect(error).toEqual(
    expect.objectContaining({
      status: 401,
      message: errorsByCode.DATASET_IMAGE_ANNOTATE
    })
  )
})

it('sets parsed error to store', async () => {
  jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
  const { error } = await store.dispatch(action, payload)
  expect(store.state.workview.error).toEqual(error)
})
