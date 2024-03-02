import { StorageAction } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'
import { setStorageAsDefault as request } from '@/utils/backend'

export const setStorageAsDefault: StorageAction<string, StoragePayload[]> = async (
  { commit, rootState },
  storageSlug
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[storage/setStorageAsDefault]: Current team not set') }

  const response = await request({
    teamSlug: currentTeam.slug,
    storageSlug
  })

  if ('error' in response) { return response }

  commit('SET_STORAGE_AS_DEFAULT', response.data.slug)

  return response
}
