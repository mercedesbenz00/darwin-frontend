import { createLocalVue } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildUserPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import team from '@/store/modules/team'
import user from '@/store/modules/user'
import { updateProfile } from '@/store/modules/user/actions/updateProfile'
import { RootState, StoreActionPayload } from '@/store/types'
import { api, errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      user: { ...user, state: cloneDeep(user.state) },
      team: { ...team, state: cloneDeep(team.state) }
    }
  })

  return store
}

const unauthorizedError = {
  response: { status: 401 }
}

const profile = buildUserPayload({
  id: 1,
  first_name: 'Joe',
  last_name: 'Smith'
})
let payload: StoreActionPayload<typeof updateProfile>

mockApi()

describe('user/updateProfile', () => {
  beforeEach(() => {
    payload = {
      first_name: 'Test',
      last_name: 'V7',
      two_factor_auth_enabled: false
    }
  })

  it('dispatches to correct api endpoint', async () => {
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: profile }))
    await store.dispatch('user/updateProfile', payload)
    expect(api.put).toHaveBeenCalledWith('users/profile', payload)
  })

  it('returns response data', async () => {
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: profile }))
    const response = await store.dispatch('user/updateProfile', payload)
    expect(response.data).toEqual(profile)
  })

  it('sets user profile into store', async () => {
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: profile }))
    await store.dispatch('user/updateProfile', payload)
    expect(store.state.user.profile).toEqual(profile)
  })

  it('adds two_factor_auth_enabled', async () => {
    const updatedProfile = {
      ...profile,
      two_factor_auth_enabled: true
    }
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: updatedProfile }))
    await store.dispatch('user/updateProfile', payload)
    expect(store.state.user.profile).toEqual({
      ...updatedProfile,
      two_factor_auth_enabled: true
    })
  })

  it('adds reload param to image', async () => {
    const updatedProfile = {
      ...profile,
      image: { url: 'foo' }
    }
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: updatedProfile }))
    await store.dispatch('user/updateProfile', payload)
    expect(store.state.user.profile).toEqual({
      ...updatedProfile,
      image: { url: 'foo' }
    })
  })

  it('uploads image to s3', async () => {
    const avatarParams = {
      ...payload,
      hash: 'hash',
      content: 'content',
      type: 'avatar'
    }

    const updatedProfile = {
      ...profile,
      image: { url: 'foo', upload_url: 'bar' }
    }
    const store = newStore()
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: updatedProfile }))
    jest.spyOn(api, 'uploadToS3').mockResolvedValue(undefined as any)
    await store.dispatch('user/updateProfile', avatarParams)
    expect(api.uploadToS3).toHaveBeenCalledWith('bar', 'content', 'avatar')
  })

  it('returns parsed error on failure', async () => {
    const store = newStore()
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('user/updateProfile', payload)
    expect(response.error).toEqual(
      expect.objectContaining({
        message: errorsByCode.PROFILE_UPDATE_NOT_AUTHORIZED,
        status: 401
      })
    )
  })

  it('returns parsed error on s3 upload failure', async () => {
    const avatarParams = {
      ...payload,
      hash: 'hash',
      content: 'content',
      type: 'avatar'
    }

    const updatedProfile = { ...profile, image: { url: 'foo', upload_url: 'bar' } }
    const store = newStore()

    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: updatedProfile }))
    jest.spyOn(api, 'uploadToS3').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('user/updateProfile', avatarParams)
    expect(response.error).toEqual(
      expect.objectContaining({
        message: errorsByCode.PROFILE_UPDATE_NOT_AUTHORIZED,
        status: 401
      })
    )
  })
})
