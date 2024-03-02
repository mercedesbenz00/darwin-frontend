import { DatasetAction } from '@/store/modules/dataset/types'
import {
  V2DatasetItemPayload
} from '@/store/types'

type Payload = {
  teamSlug: string,
  itemId: string
}
type Action = DatasetAction<
  Payload,
  V2DatasetItemPayload
>

export const refreshV2DatasetItemStage: Action = async (
  { dispatch, commit },
  { teamSlug, itemId }
) => {
  const { data } = await dispatch('loadV2DatasetItem', {
    itemId,
    teamSlug: teamSlug
  })

  commit('SET_V2_DATASET_ITEM_STAGE', data)
}
