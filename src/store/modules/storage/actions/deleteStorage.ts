import { StorageAction } from '@/store/modules/storage/types'
import { deleteStorage as request } from '@/utils/backend'

export const deleteStorage: StorageAction<string, any> = async (
  { commit, rootState },
  storageSlug
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[storage/deleteStorage]: Current team not set') }

  const response = await request({
    teamSlug: currentTeam.slug,
    storageSlug: storageSlug
  })

  if ('error' in response) { return response }

  commit('DELETE_STORAGE', storageSlug)

  return response
}
