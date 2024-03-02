import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassImagePayload,
  buildAnnotationClassPayload,
  buildAxiosResponse,
  buildTeamPayload
} from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

jest.mock('@/utils/backend', () => ({ createAnnotationClass: jest.fn() }))
jest.mock('@/utils/tutorialBackend', () => ({ createAnnotationClass: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const response = buildAnnotationClassPayload({ id: 1 })

const ACTION = 'aclass/createAnnotationClass'
let payload: StoreActionPayload<typeof createAnnotationClass>

type BackendParams = Parameters<typeof backend.createAnnotationClass>[0]

beforeEach(() => {
  store = createUnstubbedTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 7, slug: 'v7' }))

  jest.spyOn(backend, 'createAnnotationClass')
    .mockResolvedValue(buildAxiosResponse({ data: response }))
  jest.spyOn(tutorialBackend, 'createAnnotationClass').mockReturnValue({ data: response })

  payload = {
    annotationTypeNames: ['polygon', 'bounding_box'],
    datasets: [{ id: 7 }],
    name: 'Foo',
    metadata: { _color: 'auto' },
    description: 'Bar',
    images: [buildAnnotationClassImagePayload({ id: 'foo' })]
  }
})

afterEach(() => {
  (backend.createAnnotationClass as jest.Mock).mockReset();
  (tutorialBackend.createAnnotationClass as jest.Mock).mockReset()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  const expectedParams: BackendParams = {
    // ids of default annotation types created by setDefaultAnnotationTypes
    annotation_type_ids: [1, 7],
    datasets: [{ id: 7 }],
    description: 'Bar',
    images: payload.images,
    metadata: { _color: 'auto' },
    name: 'Foo',
    team_slug: 'v7'
  }
  expect(backend.createAnnotationClass).toHaveBeenCalledWith(expectedParams)
})

it('sends request to tutorial backend if applicable', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)

  await store.dispatch(ACTION, payload)

  expect(backend.createAnnotationClass).not.toHaveBeenCalled()
  const expectedParams: BackendParams = {
    // ids of default annotation types created by setDefaultAnnotationTypes
    annotation_type_ids: [1, 7],
    datasets: [{ id: 7 }],
    description: 'Bar',
    images: payload.images,
    metadata: { _color: 'auto' },
    name: 'Foo',
    team_slug: 'v7'
  }
  expect(tutorialBackend.createAnnotationClass).toHaveBeenCalledWith(expectedParams)
})

it('commits class into store', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.state.aclass.classes).toEqual([response])
})

it('returns error from backend', async () => {
  jest.spyOn(backend, 'createAnnotationClass').mockResolvedValue({ error: fakeError })
  const result = await store.dispatch(ACTION, payload)
  expect(result.error).toEqual(fakeError)
})
