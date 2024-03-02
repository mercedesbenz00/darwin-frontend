import { WorkviewAction } from '@/store/modules/workview/types'
import { loadV2Workflows as request } from '@/utils/backend'

export const loadV2Workflows: WorkviewAction<void, void> = async ({ commit, state }) => {
  if (!state.dataset) { throw new Error('Dataset not set') }

  const response = await request({
    teamSlug: state.dataset.team_slug
  })

  if ('data' in response) {
    commit('SET_V2_WORKFLOWS', response.data)
    return { data: undefined }
  }

  return response
}
