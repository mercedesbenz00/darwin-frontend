import { DatasetAction } from '@/store/modules/dataset/types'
import {
  V2DatasetItemFilter,
  V2DatasetItemPayload,
  PagedApiV2Response
} from '@/store/types'
import { loadV2DatasetItems } from '@/utils/backend'

type LoadV2DatasetItemsActionPayload = {
  datasetId: number,
  teamSlug: string,
  filter?: V2DatasetItemFilter
}
type LoadV2DatasetItemsAction = DatasetAction<
  LoadV2DatasetItemsActionPayload,
  PagedApiV2Response<V2DatasetItemPayload>
>

/**
 * Fetches dataset items.
 */
export const loadV2DatasetItemsList: LoadV2DatasetItemsAction = async (
  { getters },
  { datasetId, teamSlug, filter }
) => {
  // make a request
  const query = {
    ...(filter || (getters.datasetItemApiFilterV2)),
    dataset_ids: [datasetId],
    teamSlug: teamSlug
  }

  const response = await loadV2DatasetItems(query)

  // if response errored
  if ('error' in response) { return response }

  // if response is not a pagination response, throw an error
  if (!('items' in response.data) || !('page' in response.data)) {
    throw new Error('[dataset/loadV2DatasetItemsList]: Expected pagination response')
  }

  return { data: response.data }
}
