import { WorkviewAction } from '@/store/modules/workview/types'
import { RESET_ZOOM_MODE } from '@/store/types/ResetZoomMode'

export const setResetZoomMode: WorkviewAction<number, RESET_ZOOM_MODE> =
  ({ commit }, zoomMode) => {
    commit('SET_RESET_ZOOM_MODE', zoomMode)
  }
