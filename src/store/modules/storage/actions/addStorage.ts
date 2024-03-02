import { StorageAction } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'
import { createStorage as request } from '@/utils/backend'

export const addStorage: StorageAction<StoragePayload, StoragePayload> = async (
  { commit, dispatch, rootState },
  storage: StoragePayload
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[storage/addStorage]: Current team not set') }

  const response = await request({
    teamSlug: currentTeam.slug,
    storage
  })

  if ('error' in response) { return response }

  if (storage.default) {
    dispatch('setStorageAsDefault', response.data.slug)
  }

  commit('SET_STORAGE', response.data)

  return response
}
