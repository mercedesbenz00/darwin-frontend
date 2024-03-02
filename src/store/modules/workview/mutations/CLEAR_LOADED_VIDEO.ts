import { WorkflowMutation } from '@/store/modules/workview/types'

export const CLEAR_LOADED_VIDEO: WorkflowMutation<void> = (state) => {
  state.loadedVideos = []
}
