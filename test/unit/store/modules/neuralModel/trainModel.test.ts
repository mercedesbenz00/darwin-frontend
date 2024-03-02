import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildModelTemplatePayload,
  buildTeamPayload,
  buildTrainingClass,
  buildTrainingSessionPayload
} from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import { ModelDevice } from '@/store/modules/neuralModel/types'
import { WindErrorCodes } from '@/utils/error/errors'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ trainModel: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const modelTemplate = buildModelTemplatePayload({ id: 'model-template' })
const trainingSession = buildTrainingSessionPayload({
  id: 'fake-training-session'
})

const v7 = buildTeamPayload({ id: 5, slug: 'v7' })
const dataset = buildDatasetPayload({ id: 1, num_images: 22, slug: 'sfh', team_id: v7.id })

beforeEach(() => {
  store = createUnstubbedTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('aclass/SET_CLASSES', [flask, bottle])
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', modelTemplate)
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'A model')
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', dataset)
  store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [flask, bottle])
  store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', flask)
  store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', bottle)
  jest.spyOn(wind, 'trainModel').mockResolvedValue({ data: trainingSession })
})

afterEach(() => {
  (wind.trainModel as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/trainModel')).rejects.toThrow()
})

it("raises if current team isn't dataset team", async () => {
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 99 }))
  await expect(store.dispatch('neuralModel/trainModel')).rejects.toThrow()
})

it('responds with error if model name blank', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_NAME', '')
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(typeof error.errors.name).toBe('string')
})

it('responds with error if model template blank', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', null)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(typeof error.errors.template).toBe('string')
})

it('responds with error if no dataset selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', null)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(typeof error.errors.dataset).toBe('string')
})

it('responds with error if no classes selected', async () => {
  store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', flask)
  store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', bottle)
  store.commit('neuralModel/VALIDATE_NEW_MODEL')
  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(typeof error.errors.classes).toBe('string')
})

it('sends request', async () => {
  await store.dispatch('neuralModel/trainModel')
  const expected = {
    classes: [
      buildTrainingClass({ darwin_id: 4, name: 'Flask', type: 'polygon', subs: [], id: undefined }),
      buildTrainingClass({ darwin_id: 5, name: 'Bottle', type: 'polygon', subs: [], id: undefined })
    ],
    datasetId: 1,
    datasetSlug: 'sfh',
    datasetVersion: 1,
    modelTemplateId: 'model-template',
    name: 'A model',
    device: ModelDevice.GPU,
    teamSlug: 'v7',
    teamId: 5
  }
  expect(wind.trainModel).toHaveBeenCalledWith(expected)
})

it('sends class subs', async () => {
  const textField = buildAnnotationClassPayload({
    id: 99,
    name: 'text',
    annotation_types: ['polygon', 'text', 'directional_vector']
  })

  store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [textField])
  store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', textField)
  await store.dispatch('neuralModel/trainModel')

  const expected = expect.objectContaining({
    classes: [
      { darwin_id: 99, name: 'text', type: 'polygon', subs: ['directional_vector', 'text'] }
    ]
  })

  expect(wind.trainModel).toHaveBeenCalledWith(expected)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/trainModel')
  expect(data).toEqual(trainingSession)
})

it('pushes session to store', async () => {
  expect(store.state.neuralModel.trainingSessions).toEqual([])
  await store.dispatch('neuralModel/trainModel')
  expect(store.state.neuralModel.trainingSessions).toEqual([trainingSession])
})

it('responds with custom error on NO_PAYMENT_METHOD', async () => {
  jest.spyOn(wind, 'trainModel').mockResolvedValue({
    error: { code: WindErrorCodes.NO_PAYMENT_METHOD, isValidationError: false }
  })

  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(error.message).toContain('valid payment method')
})

it('responds with custom error on PARTNER_DOES_NOT_COVER_NEURAL_NETWORKS', async () => {
  jest.spyOn(wind, 'trainModel').mockResolvedValue({
    error: { code: WindErrorCodes.PARTNER_DOES_NOT_COVER_NEURAL_NETWORKS, isValidationError: false }
  })

  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(error.message).toContain('does not cover your neural network costs')
})

it('responds with default parsed error on failure', async () => {
  jest.spyOn(wind, 'trainModel').mockResolvedValue({
    error: { message: 'foo', isValidationError: false }
  })

  const { error } = await store.dispatch('neuralModel/trainModel')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})

it('sets validation errors', async () => {
  jest.spyOn(wind, 'trainModel').mockResolvedValue({ error: { isValidationError: true, name: 'foo' } })

  await store.dispatch('neuralModel/trainModel')
  expect(store.state.neuralModel.newModelValidationErrors).toEqual({ name: 'foo' })
})
