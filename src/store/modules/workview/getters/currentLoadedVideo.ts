import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { LoadedVideo } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

/**
 * Returns current loaded video
 */
export const currentLoadedVideo: Getter<WorkviewState, RootState> =
  (state): LoadedVideo | null => {
    const {
      loadedVideos,
      selectedDatasetItem: currentItem
    } = state
    if (!currentItem || !currentItem.dataset_video_id) { return null }
    const loadedVideo = loadedVideos.find(video => video.id === currentItem.dataset_video_id)

    return loadedVideo || null
  }
