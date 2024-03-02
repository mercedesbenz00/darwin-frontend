import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetItemPayload, DatasetItemTimeSummaryPayload } from '@/store/types'
import { loadDatasetItemTimeSummary } from '@/utils/backend'
import { loadDatasetItemTimeSummary as loadTutorialSummary } from '@/utils/tutorialBackend'

type LoadTimeSummaryAction = WorkviewAction<DatasetItemPayload, DatasetItemTimeSummaryPayload>
const loadTimeSummary: LoadTimeSummaryAction = async ({ commit, state }, item) => {
  const response = state.tutorialMode
    ? loadTutorialSummary(item)
    : await loadDatasetItemTimeSummary({ datasetItemId: item.id })

  if ('data' in response) { commit('PUSH_TIME_SUMMARY', response.data) }

  return response
}

export default loadTimeSummary
