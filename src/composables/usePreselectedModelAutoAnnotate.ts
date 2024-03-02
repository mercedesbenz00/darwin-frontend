import { computed, ComputedRef } from 'vue'

import { useStore } from '@/composables'
import { ModelType } from '@/store/types'

/**
 * Checks whether or not the preselected model is of type `auto_annotate`.
 */
export const usePreselectedModelAutoAnnotate = (): ComputedRef<boolean> => {
  const store = useStore()

  return computed(() => {
    const autoAnnotateModels = computed(() => store.state.workview.autoAnnotateModels)

    const { preselectedModelId: id } = store.state.workview

    const preselectedModel = computed(() => autoAnnotateModels.value.find(m => m.id === id) || null)
    if (!preselectedModel.value) { return false }

    const trainedModels = computed(() => store.state.neuralModel.trainedModels)
    const trainedModel = computed(() =>
      trainedModels.value.find(tm => tm.id === preselectedModel.value?.trained_model_id)
    )
    // If no trained model is found, we should assume that the preselected model
    // is in fact of AutoAnnotation type
    if (!trainedModel.value) { return true }

    return trainedModel.value.model_template.type === ModelType.AutoAnnotation
  })
}
