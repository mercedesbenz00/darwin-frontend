import { AClassAction } from '@/store/modules/aclass/types'
import { AttributePayload } from '@/store/types/AttributePayload'
import {
  createOrFetchAnnotationAttribute as backendCreateOrFetchAnnotationAttribute
} from '@/utils/backend'
import {
  createOrFetchAnnotationAttribute as tutorialCreateOrFetchAnnotationAttribute
} from '@/utils/tutorialBackend'

type CreateOrFetchAnnotationAttribute = AClassAction<
  { classId: number, name: string, color: string },
  AttributePayload
>

/**
 * Fetch attribute id if it already exists, otherwise creates it.
 * @param {integer} classId id of the annoation class containing the attribute
 * @param {string} name the name of the attribute
 * @param {string} color the color of the attribute
 */
export const createOrFetchAnnotationAttribute: CreateOrFetchAnnotationAttribute =
  async ({ commit, dispatch, rootState }, payload) => {
    const request = (() => {
      if (rootState.workview.tutorialMode) {
        return tutorialCreateOrFetchAnnotationAttribute(payload)
      }

      return backendCreateOrFetchAnnotationAttribute(payload)
    })()

    const response = await request

    if ('data' in response) {
      commit('ADD_ANNOTATION_ATTRIBUTE', response.data)
    }

    if ('error' in response) {
      await dispatch('toast/warning', { content: response.error.message }, { root: true })
    }

    return response
  }
