import { WorkviewAction } from '@/store/modules/workview/types'
import { V2DatasetItemPayload, V2DatasetItemTimeSummaryPayload } from '@/store/types'
import { loadV2DatasetItemTimeSummary } from '@/utils/backend'

type LoadV2TimeSummaryActionPayload = {
  teamSlug: string,
  item: V2DatasetItemPayload
}

type LoadTimeSummaryAction = WorkviewAction<
  LoadV2TimeSummaryActionPayload,
  V2DatasetItemTimeSummaryPayload
>

const loadV2TimeSummary: LoadTimeSummaryAction = async ({ commit }, { teamSlug, item }) => {
  const response = await loadV2DatasetItemTimeSummary({ datasetItemId: item.id, teamSlug })

  if ('data' in response) { commit('PUSH_V2_TIME_SUMMARY', response.data) }

  return response
}

export default loadV2TimeSummary
