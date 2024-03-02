import { AClassAction } from '@/store/modules/aclass/types'
import { LoadingStatus } from '@/store/types'
import { loadAnnotationTypes as backendLoadAnnotationTypes } from '@/utils/backend'
import { loadAnnotationTypes as tutorialLoadAnnotationTypes } from '@/utils/tutorialBackend'

/**
 * Loads all available annotation types from the backend.
 *
 * Annotation types are globally defined, so they do not rely on team, dataset
 * or any other record and are exactly the same for all teams.
 */
export const loadAnnotationTypes: AClassAction<void> = async ({ commit, state, rootState }) => {
  if (state.typesLoadingStatus !== LoadingStatus.Unloaded) { return }

  const response = rootState.workview.tutorialMode
    ? await tutorialLoadAnnotationTypes()
    : await backendLoadAnnotationTypes()

  commit('SET_TYPES_LOADING_STATUS', LoadingStatus.Loading)

  if ('data' in response) {
    commit('SET_TYPES', response.data)
    commit('SET_TYPES_LOADING_STATUS', LoadingStatus.Loaded)
  }

  return response
}
