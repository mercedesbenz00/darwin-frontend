import { defineStore } from 'pinia'

import { StageType } from '@/store/types'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'

type State = {
  selectedStage: V2WorkflowStagePayload | null
  selectedDatasetId: number | null
  selectedModelId: string | null
  zoomScale: number
}

type NewMapping = {
  annotationClassId: number | null,
  modelClassLabel: string
}

export const useWorkflowSceneStore = defineStore('workflowScene', {
  state: (): State => ({
    /** 
     * The stage currently being selected on the canvas 
     * This is the stage the configuration of which we are seeing in the sidebar
     */
    selectedStage: null,
    /**
     * The id of the dataset we are selecting in the sidebar 
     * when configuring a disconnected dataset stage
     */
    selectedDatasetId: null,
    /**
     * The id of the model we are selecting in the sidebar 
     * when configuring a disconnected model stage
     */
    selectedModelId: null,
    /**
     * The current canvas zoom scale
     */
    zoomScale: 1
  }),
  actions: {
    selectModel (id: string | null) {
      this.selectedModelId = id
    },
    selectDataset (id: number | null) {
      this.selectedDatasetId = id
    },
    selectStage (stage: V2WorkflowStagePayload | null) {
      this.selectedStage = stage
    },
    setClassMapping ({ annotationClassId, modelClassLabel }: NewMapping) {
      if (!this.selectedStage) { return }
      if (this.selectedStage.type !== StageType.Model) { return }
      
      // we are unsetting existing mapping
      if (annotationClassId === null) {
        this.selectedStage.config.class_mapping = 
          this.selectedStage.config.class_mapping
            .filter(m => m.model_class_label !== modelClassLabel)
        return
      }

      // we are adding or modifying an entry
      const entry = this.selectedStage.config.class_mapping
        .find((entry) => entry.model_class_label === modelClassLabel)

      if (entry !== undefined) {
        // overwriting an entry
        entry.annotation_class_id = annotationClassId
        return 
      }

      // adding a new entry
      this.selectedStage.config.class_mapping.push({
        annotation_class_id: annotationClassId,
        model_class_label: modelClassLabel
      })
    },
    setZoomScale (scale: number) {
      this.zoomScale = scale
    }
  }
})
