import { Module, ActionTree } from 'vuex'

import { RootState } from '@/store/types'
import {
  api,
  handleError,
  errorMessages,
  isErrorResponse
} from '@/utils'

export type FeedbackState = {}

export const getInitialState = (): FeedbackState => ({})

const actions: ActionTree<{}, RootState> = {
  async submit (store, params: { message: string, pageUrl: string, datasetId: number | null }) {
    let response
    try {
      response = await api.post('feedback', {
        message: params.message,
        page_url: params.pageUrl,
        dataset_id: params.datasetId
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return handleError(this, error, errorMessages.FEEDBACK_SUBMIT)
    }

    return response
  }
}

const feedback: Module<{}, RootState> = {
  namespaced: true,
  actions
}

export default feedback
