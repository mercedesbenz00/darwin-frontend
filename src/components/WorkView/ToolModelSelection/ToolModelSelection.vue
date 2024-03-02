<template>
  <v2-model-selection-dropdown
    class="tool-model-selection"
    placeholder="Select Model"
    :options="modelOptions"
    :value="selectedModelId"
    @change="onChange($event)"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  V2ModelSelectionDropdown
} from '@/components/WorkView/ToolModelSelection/ModelSelectionDropdown/V2'
import { Editor } from '@/engine/editor'
import { isPreselectedModelAutoAnnotate } from '@/engine/plugins/click/utils'
import { ModelType, RunningSessionPayload, TrainedModelPayload } from '@/store/types'

import { ClassDescriptor } from './types'

type ModelOption = {
  id: string,
  classes: ClassDescriptor[],
  label: string,
  type: ModelType
}

@Component({
  name: 'tool-model-selection',
  components: {
    V2ModelSelectionDropdown
  }
})
export default class ToolModelSelection extends Vue {
  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  @Prop({ required: true })
  models!: RunningSessionPayload[];

  @State(state => state.workview.preselectedModelId)
  selectedModelId!: string | null;

  modelClasses (model: RunningSessionPayload): ClassDescriptor[] {
    const trainedModel = this.trainedModels.find(tm => tm.id === model.trained_model_id)
    if (!trainedModel) { return [] }

    const { classes } = trainedModel
    const initialClasses = classes.map(c => ({ label: c.name }))
    return initialClasses
  }

  get modelOptions (): ModelOption[] {
    return this.models
      .map((model) => {
        const trainedModel = this.trainedModels.find(tm => tm.id === model.trained_model_id)
        if (!trainedModel) {
          return { id: model.id, classes: [], label: model.name, type: ModelType.AutoAnnotation }
        }
        return {
          id: model.id,
          classes: this.modelClasses(model),
          label: model.name,
          type: trainedModel.model_template.type
        }
      })
      .reduce((acc: ModelOption[], option: ModelOption) => {
        if (option?.label !== 'Generic Auto-Annotate') {
          return [...acc, option]
        }
        return [{ ...option, classes: [{ label: 'Class agnostic' }] }, ...acc]
      }, [])
  }

  onChange (modelId: string): void {
    this.$store.commit('workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID', modelId || null)
  }

  @State(state => state.workview.autoAnnotateModels)
  autoAnnotateModels!: RunningSessionPayload[]

  @State(state => state.neuralModel.trainedModels)
  trainedModels!: TrainedModelPayload[]

  @Watch('selectedModelId')
  onSelectedModelId (): void {
    const { editor } = this

    if (isPreselectedModelAutoAnnotate(editor)) { return }

    const { currentTool } = editor.toolManager
    if (!currentTool) { return }

    currentTool.tool.reset(currentTool.context)
    editor.activeView.annotationsLayer.changed()
  }
}
</script>

<style lang="scss" scoped>
.tool-model-selection {
  width: 200px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tool-model-selection__select2-results__option-cover {
  height: 60px;
  margin: 0 10px 0 10px;
}
</style>
