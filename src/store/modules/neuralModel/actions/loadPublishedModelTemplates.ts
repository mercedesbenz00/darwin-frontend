import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadPublishedModelTemplates as windRequest } from '@/utils/wind'
import { ModelTemplatePayload } from '@/utils/wind/types'

type Action = NeuralModelAction<void, ModelTemplatePayload[]>

export const loadPublishedModelTemplates: Action = async ({ commit, rootState }) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) {
    throw new Error('[neuralModel/loadPublishedModelTemplates]: Current team not set')
  }

  const response = await windRequest({ teamId: currentTeam.id })

  if ('data' in response) {
    commit('SET_MODEL_TEMPLATES', response.data)
    return response
  }

  return response
}
