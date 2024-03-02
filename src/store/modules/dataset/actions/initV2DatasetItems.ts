import { DatasetAction } from '@/store/modules/dataset/types'
import {
  V2DatasetItemFilter,
  V2DatasetItemPayload,
  PagedApiV2Response
} from '@/store/types'
import { loadV2DatasetIds } from '@/utils/backend'

type LoadV2DatasetItemsActionPayload = {
  datasetId: number,
  teamSlug: string,
  filter?: V2DatasetItemFilter
}
type LoadV2DatasetItemsAction = DatasetAction<
  LoadV2DatasetItemsActionPayload,
  PagedApiV2Response<V2DatasetItemPayload>
>

export const initV2DatasetItems: LoadV2DatasetItemsAction = async (
  { getters, commit },
  { datasetId, teamSlug, filter }
) => {
  // make a request
  const query = {
    ...(filter || (getters.datasetItemApiFilterV2)),
    dataset_ids: [datasetId],
    teamSlug: teamSlug
  }

  const response = await loadV2DatasetIds(query)

  // if response errored
  if ('error' in response) { return response }

  // if response is not a pagination response, throw an error
  if (!('item_ids' in response.data)) {
    throw new Error('[dataset/initV2DatasetItems]: Expected items ids!')
  }

  commit('INIT_V2_DATASET_ITEMS', response.data.item_ids)
}
