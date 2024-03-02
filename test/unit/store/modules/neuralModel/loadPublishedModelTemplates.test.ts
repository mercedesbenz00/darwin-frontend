import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildModelTemplatePayload, buildTeamPayload } from 'test/unit/factories'

import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadPublishedModelTemplates: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const modelTemplate = buildModelTemplatePayload({ id: 'model-template' })

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadPublishedModelTemplates').mockResolvedValue({ data: [modelTemplate] })
})

afterEach(() => {
  (wind.loadPublishedModelTemplates as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/loadPublishedModelTemplates')).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/loadPublishedModelTemplates')
  expect(wind.loadPublishedModelTemplates).toHaveBeenCalledWith({ teamId: 7 })
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/loadPublishedModelTemplates')
  expect(data).toEqual([modelTemplate])
})

it('pushes response to state', async () => {
  await store.dispatch('neuralModel/loadPublishedModelTemplates')
  expect(store.state.neuralModel.modelTemplates).toEqual([modelTemplate])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'loadPublishedModelTemplates').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/loadPublishedModelTemplates')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
