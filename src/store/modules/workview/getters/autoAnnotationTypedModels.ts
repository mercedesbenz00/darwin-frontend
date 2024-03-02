import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { ModelType, RootState, RunningSessionPayload } from '@/store/types'

export const autoAnnotationTypedModels: Getter<WorkviewState, RootState> = (
  state: WorkviewState,
  getters,
  rootState: RootState
) =>
  (): RunningSessionPayload[] => {
    const autoAnnotateTrainedModelIds = rootState.neuralModel.trainedModels
      .filter(tm => tm.model_template.type === ModelType.AutoAnnotation)
      .map(tm => tm.id)

    return state.autoAnnotateModels
      .filter(m => autoAnnotateTrainedModelIds.includes(m.trained_model_id))
  }
