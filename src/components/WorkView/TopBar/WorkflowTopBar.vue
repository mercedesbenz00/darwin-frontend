<template>
  <top-bar class="workflow-top-bar">
    <template #left>
      <tool-model-selection
        v-if="autoAnnotationOn"
        :editor="editor"
        :models="models"
      />
      <auto-annotate-class-mapper
        v-if="autoAnnotationOn && !isPreselectedModelAutoAnnotate"
        :editor="editor"
      />
      <tool-class-selection
        v-if="!autoAnnotationOn || (autoAnnotationOn && isPreselectedModelAutoAnnotate)"
        class="workflow-top-bar__class-selection"
        :editor="editor"
        @add-class="$emit('add-class')"
      />
      <clicker-coarse-slider v-if="autoAnnotationOn && isPreselectedModelAutoAnnotate" />
      <auto-annotate-slider
        v-if="autoAnnotationOn && !isPreselectedModelAutoAnnotate"
        :editor="editor"
      />
      <tool-options :editor="editor" />
    </template>
    <template #center>
      <div class="workflow-top-bar__center">
        <div class="workflow-top-bar__pagination">
          <div class="workflow-top-bar__tags">
            <badge
              v-if="isExternal"
              v-tooltip="externalTooltip"
              label="EXTERNAL"
              :color="{ r: 240, g: 160, b: 77, a: 1 }"
              high-contrast
              no-tooltip
            />
            <badge
              v-if="isDicom"
              v-tooltip="externalTooltip"
              label="DICOM"
              :color="{ r: 145, g: 169, b: 192, a: 1 }"
              high-contrast
              no-tooltip
            />
            <badge
              v-if="isPdf"
              v-tooltip="externalTooltip"
              label="PDF"
              :color="{ r: 145, g: 169, b: 192, a: 1 }"
              high-contrast
              no-tooltip
            />
          </div>
          <workflow-pagination :editor="editor" />
        </div>
        <workflow-warning v-if="showTracker" />
      </div>
    </template>
    <template
      v-if="selectedDatasetItem"
      #right
    >
      <workflow-tracker v-if="showTracker" />
      <v2-stage-selector v-if="isVersion2" />
      <v2-stages v-if="isVersion2" />
      <stages v-else />
      <div class="workflow-top-bar__controls">
        <v2-workflow-controls
          v-if="isVersion2"
          class="workflow-top-bar__controls__buttons"
        />
        <workflow-controls
          v-else
          class="workflow-top-bar__controls__buttons"
        />
        <action-history-trigger
          class="workflow-top-bar__controls__more"
        />
      </div>
    </template>
  </top-bar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Badge } from '@/components/Common/Badge'
import ClassMapping from '@/components/DatasetSettings/ModelStage/ClassMapping.vue'
import ClickerCoarseSlider from '@/components/WorkView/ClickerCoarseSlider/ClickerCoarseSlider.vue'
import WorkflowPagination from '@/components/WorkView/Pagination/WorkflowPagination.vue'
import ToolClassSelection from '@/components/WorkView/ToolClassSelection/ToolClassSelection.vue'
import ToolModelSelection from '@/components/WorkView/ToolModelSelection/ToolModelSelection.vue'
import Stages from '@/components/WorkView/TopBar/Stages/V1/Stages.vue'
import V2Stages from '@/components/WorkView/TopBar/Stages/V2/Stages.vue'
import { ActionHistoryTrigger } from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { WorkflowControls } from '@/components/WorkView/TopBar/WorkflowControls/V1'
import { V2WorkflowControls } from '@/components/WorkView/TopBar/WorkflowControls/V2'
import WorkflowWarning from '@/components/WorkView/TopBar/components/WorkflowWarning.vue'
import WorkflowTracker from '@/components/WorkView/Tracker/WorkflowTracker.vue'
import { Editor } from '@/engine/editor'
import { isPreselectedModelAutoAnnotate } from '@/engine/plugins/click/utils'
import { DatasetItemPayload, RunningSessionPayload } from '@/store/types'

import AutoAnnotateSlider from './AutoAnnotateSlider/AutoAnnotateSlider.vue'
import ToolOptions from './ToolOptions/ToolOptions.vue'
import TopBar from './TopBar.vue'
import AutoAnnotateClassMapper from './components/AutoAnnotateClassMapper.vue'

@Component({
  name: 'workflow-top-bar',
  components: {
    ActionHistoryTrigger,
    AutoAnnotateClassMapper,
    AutoAnnotateSlider,
    Badge,
    ClassMapping,
    ClickerCoarseSlider,
    Stages,
    V2Stages,
    ToolClassSelection,
    ToolModelSelection,
    ToolOptions,
    TopBar,
    V2WorkflowControls,
    WorkflowControls,
    WorkflowPagination,
    WorkflowTracker,
    WorkflowWarning
  }
})
export default class WorkflowTopBar extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  @Prop({ required: true, type: Object as () => Editor })
  editor!: Editor

  readonly externalTooltip = {
    content: [
      'This image is stored on a client server.',
      'It may have a different loading speed than normal depending on your location.'
    ].join(' ')
  }

  get isExternal (): boolean {
    const { selectedDatasetItem } = this
    if (!selectedDatasetItem) { return false }
    if (selectedDatasetItem.dataset_image) {
      return selectedDatasetItem.dataset_image.image.external
    }
    if (selectedDatasetItem.dataset_video) {
      return !!selectedDatasetItem.dataset_video.external
    }
    return false
  }

  get isDicom (): boolean {
    return !!this.editor.activeView.isDicomItem
  }

  get isPdf (): boolean {
    return !!this.editor.activeView.isPdfItem
  }

  get showTracker (): boolean {
    return !!this.selectedDatasetItem && this.trackingEnabled
  }

  @State(state => state.workview.currentTool)
  currentTool!: string

  get autoAnnotationOn (): boolean {
    return this.currentTool === 'clicker_tool'
  }

  get isPreselectedModelAutoAnnotate (): boolean {
    return isPreselectedModelAutoAnnotate(this.editor)
  }

  @State(state => state.workview.autoAnnotateModels)
  models!: RunningSessionPayload[]

  @State(state => state.workview.tutorialMode)
  tutorialMode!: boolean

  get trackingEnabled (): boolean {
    return !this.tutorialMode
  }

  get isVersion2 (): boolean {
    return this.$store.getters['dataset/isVersion2']
  }
}
</script>

<style lang="scss" scoped>
.workflow-top-bar {
  position: relative;
  background-color: $colorSurfaceBackground;

  &__center {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: auto auto auto auto;
    align-items: center;
    height: 100%;
    margin: 0 8px;

    > :first-child {
      justify-self: right;
    }

    > :last-child() {
      justify-self: left;
    }

    > :not(:first-child),
    > :not(:last-child) {
      justify-self: center;
    }
  }

  &__pagination {
    @include row--center;
    align-items: center;
    gap: 8px;
  }

  &__tags {
    @include row--center;
  }

  &__class-selection {
    margin: 0 8px 0 0;
  }

  &__controls {
    @include row;
    align-items: center;
    gap: 8px;

    &__buttons {
      position: relative;
    }

    &__more {
      width: 32px;
      @include row--center;
    }
  }
}
</style>
