import { AClassAction } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'
import {
  loadDatasetAnnotationAttributes as backendLoadLoadDatasetAnnotationAttributes
} from '@/utils/backend'
import {
  loadDatasetAnnotationAttributes as tutorialLoadDatasetAnnotationAttributes
} from '@/utils/tutorialBackend'

type LoadDatasetAnnotationAttributes = AClassAction<
  { teamSlug: string },
  AttributePayload[]
>

/**
 * Load annotation attributes for a specific class
 * @param {integer} classId
 */
export const loadDatasetAnnotationAttributes: LoadDatasetAnnotationAttributes =
  async ({ commit, dispatch, rootState }, payload) => {
    const request = (() => {
      if (rootState.workview.tutorialMode) {
        return tutorialLoadDatasetAnnotationAttributes(payload)
      }

      return backendLoadLoadDatasetAnnotationAttributes(payload)
    })()

    const response = await request
    if ('data' in response) {
      commit('SET_ANNOTATION_ATTRIBUTE', { attributes: response.data })
    }

    if ('error' in response) {
      dispatch('toast/warning', { content: response.error.message }, { root: true })
    }

    return response
  }
