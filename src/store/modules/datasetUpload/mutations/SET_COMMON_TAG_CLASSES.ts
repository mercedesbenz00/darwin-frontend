import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'
import { AnnotationClassPayload } from '@/store/types'

export const SET_COMMON_TAG_CLASSES: DatasetUploadMutation<AnnotationClassPayload[]> =
  (state, tagClasses) => {
    state.tagClasses = [...tagClasses]
  }
