import { AClassAction } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types'
import {
  loadClassAnnotationAttributes as backendLoadClassAnnotationAttributes
} from '@/utils/backend'
import {
  loadClassAnnotationAttributes as tutorialLoadClassAnnotationAttributes
} from '@/utils/tutorialBackend'

type LoadClassAnnotationAttributes = AClassAction<
  { classId: number },
  AttributePayload[]
>

/**
 * Load annotation attributes for a specific class
 * @param {integer} classId
 */

export const loadClassAnnotationAttributes: LoadClassAnnotationAttributes =
  async ({ commit, dispatch, rootState }, payload) => {
    const request = (() => {
      if (rootState.workview.tutorialMode) {
        return tutorialLoadClassAnnotationAttributes(payload)
      }

      return backendLoadClassAnnotationAttributes(payload)
    })()

    const response = await request
    if ('data' in response) {
      const { classId } = payload
      commit('SET_ANNOTATION_ATTRIBUTE', { classId, attributes: response.data })
    }

    if ('error' in response) {
      dispatch('toast/warning', { content: response.error.message }, { root: true })
    }

    return response
  }
