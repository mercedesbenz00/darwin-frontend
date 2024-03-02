import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildAxiosResponse, buildTeamPayload } from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadAnnotationClasses: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const response = {
  annotation_classes: [
    buildAnnotationClassPayload({ id: 1 }),
    buildAnnotationClassPayload({ id: 2 })
  ],
  type_counts: [
    { type: 'All', count: 3 }
  ]
}

const ACTION = 'aclass/loadTeamAnnotationClasses'

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadAnnotationClasses')
    .mockResolvedValue(buildAxiosResponse({ data: response }))
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7, slug: 'teamSlug' }))
})

afterEach(() => {
  (backend.loadAnnotationClasses as jest.Mock).mockReset()
})

it('raises if no current team', () => {
  store.commit('team/RESET_ALL')
  expect(store.dispatch(ACTION, { teamSlug: '' })).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, { teamSlug: 'teamSlug' })
  expect(backend.loadAnnotationClasses).toHaveBeenCalledWith({
    teamSlug: 'teamSlug', include_tags: true
  })
})

it('pushes classes to store', async () => {
  await store.dispatch(ACTION, { teamSlug: 'teamSlug' })
  expect(store.state.aclass.classes.length).toEqual(2)
})

it('pushes type_counts into store', async () => {
  await store.dispatch(ACTION, { teamSlug: 'teamSlug' })
  expect(store.state.aclass.details).toEqual(
    expect.objectContaining({ type_counts: [{ type: 'All', count: 3 }] })
  )
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'loadAnnotationClasses').mockResolvedValue({ error: fakeError })
  const result = await store.dispatch(ACTION, { teamSlug: 'teamSlug' })
  expect(result.error).toEqual(fakeError)
})
