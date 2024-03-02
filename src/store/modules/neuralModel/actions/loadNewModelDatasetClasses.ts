import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { loadAnnotationClasses as request } from '@/utils/backend'

/**
 * Fetches dataset from backend and pushes into store
 */
export const loadNewModelDatasetClasses: NeuralModelAction<void> = async (
  { commit, state, rootState }
) => {
  const { newModelDataset } = state

  if (!newModelDataset) {
    throw new Error('Cannot fetch sample items with no dataset selected')
  }
  const currentTeamSlug = rootState.team.currentTeam?.slug
  if (!currentTeamSlug) {
    throw new Error('Cannot fetch sample items without current team')
  }

  const response = await request({
    dataset_ids: [newModelDataset.id],
    include_tags: true,
    teamSlug: currentTeamSlug
  })

  if ('data' in response && 'annotation_classes' in response.data) {
    commit('SET_NEW_MODEL_ANNOTATION_CLASSES', response.data.annotation_classes)
  }

  return response
}
