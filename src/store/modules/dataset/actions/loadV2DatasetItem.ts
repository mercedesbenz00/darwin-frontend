import { DatasetAction } from '@/store/modules/dataset/types'
import {
  V2DatasetItemPayload
} from '@/store/types'
import { loadV2DatasetItem as request } from '@/utils/backend'

type LoadV2DatasetItemsActionPayload = {
  teamSlug: string,
  itemId: string
}
type LoadV2DatasetItemsAction = DatasetAction<
  LoadV2DatasetItemsActionPayload,
  V2DatasetItemPayload
>

export const loadV2DatasetItem: LoadV2DatasetItemsAction = async (
  _,
  { teamSlug, itemId }
) => {
  // make a request
  const query = {
    itemId,
    teamSlug: teamSlug
  }

  const response = await request(query)

  // if response errored
  if ('error' in response) { return response }

  if (!('data' in response)) {
    throw new Error('[dataset/loadV2DatasetItem]: Expected response')
  }

  return { data: response.data }
}
