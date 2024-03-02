import { loadImageFromUrl } from '@/engine/utils'
import {
  LoadedImage,
  WorkviewAction
} from '@/store/modules/workview/types'
import { DatasetImagePayload } from '@/store/types'
import { isErrorResponse, parseError } from '@/utils'

type Action = WorkviewAction<DatasetImagePayload, LoadedImage | undefined>

export const loadItemImageData: Action =
  async ({ commit, state }, datasetImage) => {
    const matched = state.loadedImages.find(i => i.id === datasetImage.image.id)
    if (matched) { return { data: matched } }

    let image: HTMLImageElement

    try {
      image = await loadImageFromUrl(datasetImage.image.url)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }

    commit('PUSH_LOADED_IMAGE', { payload: datasetImage, image })

    return { data: state.loadedImages.find(i => i.id === datasetImage.image.id) }
  }
