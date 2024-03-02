import { WorkflowMutation } from '@/store/modules/workview/types'

export const SET_ANNOTATION_OVERLAY_DISABLED: WorkflowMutation<boolean> = (state, disabled) => {
  state.annotationOverlayDisabled = disabled
}
