import { StorageAction } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'
import { updateStorage as request } from '@/utils/backend'

export const updateStorage: StorageAction<StoragePayload, StoragePayload[]> = async (
  { commit, dispatch, rootState },
  storage
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[storage/updateStorage]: Current team not set') }

  const response = await request({
    teamSlug: currentTeam.slug,
    storage
  })

  if ('error' in response) { return response }

  if (storage.default) {
    dispatch('setStorageAsDefault', storage.slug)
  }

  /**
   * Delete storage is needed
   * because on name update it changes the slug
   * so easier to just replace old storage with the new one
   */
  commit('DELETE_STORAGE', storage.slug)
  commit('SET_STORAGE', response.data)

  return response
}
