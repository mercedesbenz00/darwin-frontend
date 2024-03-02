import { AxiosResponse } from 'axios'

import {
  LoadedItem,
  WorkviewAction
} from '@/store/modules/workview/types'
import { DatasetItemPayload, V2SlotSectionResponse } from '@/store/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'
import { isErrorResponse, ParsedError } from '@/utils'
import { loadFile as request } from '@/utils/backend'
import { PagePayload, TilesRequestPayload } from '@/utils/backend/loadFile'

type Action = WorkviewAction<DatasetItemPayload, LoadedItem | undefined>

export const loadItem: Action = ({ dispatch }, item) => {
  const { dataset_image: datasetImage, dataset_video: datasetVideo } = item
  if (datasetImage === null && datasetVideo === null) {
    throw new Error('Cannot load item data. Item is not an image nor a video.')
  }
  if (datasetImage === null) {
    return dispatch('loadItemVideoData', item)
  }
  if (datasetImage.image.format === 'tiled') {
    return dispatch('loadTiledImageData', datasetImage)
  }
  return dispatch('loadItemImageData', datasetImage)
}
type Payload = {
  item: V2DatasetItemPayload
  file: V2DatasetItemSlot
  page?: PagePayload
  tiles?: TilesRequestPayload
}

export const loadItemV2: WorkviewAction<Payload,V2SlotSectionResponse | undefined> =
  async ({ dispatch, rootState }, payload) => {
    const { currentTeam } = rootState.team
    if (!currentTeam) {
      throw new Error('Cannot find current team')
    }

    let response: AxiosResponse<V2SlotSectionResponse> | ParsedError
    try {
      response = await request({
        teamSlug: currentTeam.slug,
        slotName: payload.file.slot_name,
        itemId: payload.item.id,
        page: payload.page,
        tiles: payload.tiles
      })
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return dispatch('toast/warning', { content: error.message })
    }

    if ('error' in response) {
      return dispatch('toast/warning', { content: response.error.message })
    }

    return response
  }
