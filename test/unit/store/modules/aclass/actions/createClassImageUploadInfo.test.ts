import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildTeamPayload,
  buildTeamUploadInfoPayload
} from 'test/unit/factories'

import { createClassImageUploadInfo } from '@/store/modules/aclass/actions/createClassImageUploadInfo'
import { StoreActionPayload } from '@/store/types'
import { errorsByCode } from '@/utils'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ createUploadInfo: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'aclass/createClassImageUploadInfo'
let payload: StoreActionPayload<typeof createClassImageUploadInfo>
const response = buildTeamUploadInfoPayload({ team_id: 1 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'createUploadInfo').mockResolvedValue(buildAxiosResponse({ data: response }))
  payload = { team: buildTeamPayload({ id: 1, slug: 'test-team' }), type: 'annotation_class' }
})

afterEach(() => {
  (backend.createUploadInfo as jest.Mock).mockReset()
})

it('sends request to backend', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.createUploadInfo).toHaveBeenCalledWith({
    teamSlug: 'test-team',
    type: 'annotation_class'
  })
})

it('returns the response', async () => {
  const result = await store.dispatch(ACTION, payload)
  expect(result).toEqual(buildAxiosResponse({ data: response }))
})

it('returns error from backend', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'createUploadInfo').mockResolvedValue({ error })
  const result = await store.dispatch(ACTION, payload)
  expect(result.error.message).toEqual(errorsByCode.ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED)
})
