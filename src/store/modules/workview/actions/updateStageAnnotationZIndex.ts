import { WorkviewAction, StageAnnotation } from '@/store/modules/workview/types'

type Params = {
  annotation: StageAnnotation
  zIndex: number
}

/**
 * Update a single annotation's zIndex
 */
const updateAnnotationZIndex: WorkviewAction<Params, StageAnnotation> =
  async ({ dispatch, rootGetters }, { annotation, zIndex }) => {
    const isVersion2: boolean = rootGetters['dataset/isVersion2']
    const action = isVersion2 ? 'updateV2Annotation' : 'updateStageAnnotation'

    return await dispatch(action, { ...annotation, z_index: zIndex })
  }

export default updateAnnotationZIndex
