import { StorageAction } from '@/store/modules/storage/types'
import { StoragePayload } from '@/store/types/StoragePayload'
import { getStorages as request } from '@/utils/backend'

export const getStorages: StorageAction<null, StoragePayload[]> = async (
  { commit, rootState }
) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[storage/getStorage]: Current team not set') }

  const response = await request({
    teamSlug: currentTeam?.slug
  })

  if ('error' in response) { return response }

  commit('SET_STORAGES', response.data)
  return response
}
