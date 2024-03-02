import { createLocalVue } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildUserPayload, buildAxiosResponse } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import team from '@/store/modules/team'
import user from '@/store/modules/user'
import { RootState, UserPayload } from '@/store/types'
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

mockApi()

describe('user/loadProfile', () => {
  const store = newStore()

  beforeEach(() => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: profile }))
  })

  it('dispatches to correct api endpoint', async () => {
    await store.dispatch('user/loadProfile')
    expect(api.get).toHaveBeenCalledWith('users/profile')
  })

  it('returns response data', async () => {
    const response = await store.dispatch('user/loadProfile')
    expect(response.data).toEqual(profile)
  })

  it('sets user profile into store', async () => {
    await store.dispatch('user/loadProfile')
    expect(store.state.user.profile).toEqual(profile)
  })

  it('returns parsed error on failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('user/loadProfile')
    expect(response.error).toEqual(
      expect.objectContaining({
        message: errorsByCode.PROFILE_LOAD,
        status: 401
      })
    )
  })
})

describe('user/deleteProfile', () => {
  it('dispatches to correct api endpoint', async () => {
    const store = newStore()
    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: {} }))
    await store.dispatch('user/deleteProfile')
    expect(api.remove).toHaveBeenCalledWith('users/profile', {})
  })

  it('returns response data', async () => {
    const store = newStore()
    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: {} }))
    const response = await store.dispatch('user/deleteProfile')
    expect(response.data).toEqual({})
  })

  it('returns parsed error on failure', async () => {
    const store = newStore()
    jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('user/deleteProfile')
    expect(response.error).toEqual(
      expect.objectContaining({
        message: errorsByCode.PROFILE_DELETE_NOT_AUTHORIZED,
        status: 401
      })
    )
  })
})

describe('user/confirmTutorial', () => {
  const store = newStore()

  const mockResponse: { data: UserPayload } = {
    data: { ...profile, tutorial_seen: true }
  }

  it('dispatches to correct api endpoint', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(mockResponse))
    await store.dispatch('user/confirmTutorial')
    expect(api.post).toHaveBeenCalledWith('users/confirm_tutorial', {})
  })

  it('returns response data', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(mockResponse))
    const response = await store.dispatch('user/confirmTutorial')
    expect(response.data).toEqual(mockResponse.data)
  })

  it('sets user tutorial seen', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse(mockResponse))
    store.commit('user/SET_PROFILE', profile)
    expect(store.state.user.profile!.tutorial_seen).toBe(false)

    await store.dispatch('user/confirmTutorial')
    expect(store.state.user.profile!.tutorial_seen).toBe(true)
  })

  it('returns parsed error on failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('user/confirmTutorial')
    expect(response.error).toEqual(
      expect.objectContaining({
        message: errorsByCode.PROFILE_UPDATE_NOT_AUTHORIZED,
        status: 401
      })
    )
  })
})

describe('user/SET_PROFILE', () => {
  const profileB = buildUserPayload({ id: 2, first_name: 'Sam' })
  it('sets profile when no previous profile', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', profile)
    expect(store.state.user.profile).toEqual(profile)
  })
  it('overwrites existing profile', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', profile)
    store.commit('user/SET_PROFILE', profileB)
    expect(store.state.user.profile).toEqual(profileB)
  })
})

describe('user/SET_PROFILE_AVATAR_URL', () => {
  const profileWithImage = buildUserPayload({
    image: {
      id: 1,
      height: 50,
      width: 50,
      original_filename: '',
      external: false,
      uploaded: true,
      key: 'foo',
      url: 'foo',
      thumbnail_url: 'bar'
    }
  })

  const profileWithoutImage = buildUserPayload({})

  it('sets avatar url for existing profile image', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', profileWithImage)
    store.commit('user/SET_PROFILE_AVATAR_URL', 'baz')
    expect(store.state.user.profile!.image!.url).toEqual('baz')
  })
  it('sets avatar url for existing profile if no previous image', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE', profileWithoutImage)
    store.commit('user/SET_PROFILE_AVATAR_URL', 'baz')
    expect(store.state.user.profile!.image!.url).toEqual('baz')
  })
  it('does nothing if no profile loaded', () => {
    const store = newStore()
    store.commit('user/SET_PROFILE_AVATAR_URL', 'baz')
    expect(store.state.user.profile).toBeNull()
  })
})
