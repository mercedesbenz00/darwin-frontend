import {
  LoadedImage,
  WorkviewAction
} from '@/store/modules/workview/types'
import { DatasetImagePayload } from '@/store/types'

type Action = WorkviewAction<DatasetImagePayload, LoadedImage | undefined>

export const loadTiledImageData: Action =
  ({ commit, state }, datasetImage) => {
    const matched = state.loadedImages.find(i => i.id === datasetImage.image.id)
    if (matched) { return { data: matched } }

    // Empty image, tiled images don't need to be actually loaded
    commit('PUSH_LOADED_IMAGE', { payload: datasetImage, image: new Image() })

    return { data: state.loadedImages.find(i => i.id === datasetImage.image.id) }
  }
