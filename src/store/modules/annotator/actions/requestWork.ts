import { AnnotatorAction } from '@/store/modules/annotator/types'
import { DatasetPayload, DatasetItemPayload } from '@/store/types'
import { requestWork as request } from '@/utils/backend'

/**
 * Request more work in a dataset
 *
 * On the backend, this provides a set of unassigned stages and
 * assigns them to the authenticated user.
 *
 * @param {Object} dataset
 * The dataset to request work for. Should contain at least an id key.
 */
const requestWork: AnnotatorAction<DatasetPayload, DatasetItemPayload[]> =
    async ({ commit }, dataset) => {
      const response = await request({ datasetId: dataset.id })
      if ('data' in response) { commit('PUSH_ITEMS', response.data) }
      return response
    }

export default requestWork
