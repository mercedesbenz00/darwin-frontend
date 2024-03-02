import { AClassAction } from '@/store/modules/aclass/types'
import { LoadingStatus } from '@/store/types'
import { loadAnnotationClasses as backendRequest } from '@/utils/backend'
import { loadAnnotationClasses as tutorialRequest } from '@/utils/tutorialBackend'

// there was an attempt to do use PUSH_CLASSES with chunks like this to speed things up.
// that was not actually working, but keeping the code for now, as it might be needed in a related
// thing

// function chunking<T> (arr: Array<T>, callback: (arr: Array<T>) => void, perChunk = 200) {
//   let i; let j; let temporary: Array<T>; const chunk = Math.ceil(arr.length / perChunk)
//   for (i = 0, j = arr.length; i < j; i += chunk) {
//     temporary = arr.slice(i, i + chunk);
//     ((arr) => setTimeout(() => {
//       callback(arr)
//     }))(temporary)
//   }
// }

type LoadAnnotationClasses = AClassAction<{ teamSlug: string }>

/**
 * Search Annotation Classes available for this team
 * @param filter Filter
 * @param datasetId
 */
export const loadTeamAnnotationClasses: LoadAnnotationClasses =
  async ({ commit, rootState }, { teamSlug }) => {
    if (!teamSlug) {
      throw new Error('Cannot load annotation classes without current team info')
    }

    commit('SET_CLASSES_LOADING_STATUS', LoadingStatus.Loading)

    const response = rootState.workview.tutorialMode
      ? tutorialRequest()
      : await backendRequest({ teamSlug, include_tags: true })

    if ('data' in response) {
      commit('SET_CLASSES', response.data.annotation_classes)
      // commit('SET_CLASSES', response.data.annotation_classes)
      commit('SET_CLASS_DETAILS', response.data)
    }

    commit('SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)

    return response
  }
