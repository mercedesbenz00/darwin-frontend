import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadAnnotationClasses: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const sfh = buildDatasetPayload({ id: 5 })
const v7 = buildTeamPayload({ id: 2 })

beforeEach(() => {
  jest
    .spyOn(backend, 'loadAnnotationClasses')
    .mockResolvedValue(
      buildAxiosResponse({ data: { annotation_classes: [bottle, flask] } })
    )
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
  store.commit('team/SET_CURRENT_TEAM', v7)
})

afterEach(() => {
  (backend.loadAnnotationClasses as jest.Mock).mockReset()
})

const ACTION = 'neuralModel/loadNewModelDatasetClasses'

it('raises if no dataset selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', null)
  await expect(store.dispatch(ACTION)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch(ACTION)
  const expected: Parameters<typeof backend.loadAnnotationClasses>[0] = {
    dataset_ids: [sfh.id],
    include_tags: true,
    teamSlug: v7.slug
  }
  expect(backend.loadAnnotationClasses).toHaveBeenNthCalledWith(1, expected)
})

it('returns raw data', async () => {
  const response = await store.dispatch(ACTION)
  expect(response.data).toEqual({ annotation_classes: [bottle, flask] })
})

it('pushes response to state', async () => {
  await store.dispatch(ACTION)
  expect(store.state.neuralModel.newModelAnnotationClasses).toEqual([bottle, flask])
})

it('returns parsed error on failure', async () => {
  (backend.loadAnnotationClasses as jest.Mock).mockReset()
  jest.spyOn(backend, 'loadAnnotationClasses').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch(ACTION)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
