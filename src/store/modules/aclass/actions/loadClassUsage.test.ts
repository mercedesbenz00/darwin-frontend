import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildClassUsagePayload, buildTeamPayload } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadClassUsage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ slug: 'v7' })

const defaultParams = {
  teamSlug: v7.slug,
  annotationClassIds: [1, 2, 3]
}

const classUsage = buildClassUsagePayload()

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadClassUsage')
    .mockResolvedValue(buildAxiosResponse({ data: classUsage }))
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('aclass/loadClassUsage')).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch('aclass/loadClassUsage', defaultParams)
  expect(backend.loadClassUsage).toHaveBeenCalledWith(
    { annotation_class_ids: defaultParams.annotationClassIds, teamSlug: 'v7' })
})

it('returns response', async () => {
  const response = await store.dispatch('aclass/loadClassUsage', defaultParams)
  expect(response.data).toEqual(classUsage)
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'loadClassUsage').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  expect(await store.dispatch('aclass/loadClassUsage', defaultParams))
    .toEqual({ error: { message: 'foo', isValidationError: false } })
})
