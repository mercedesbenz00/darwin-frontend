<template>
  <top-bar class="workflow-top-bar">
    <template #left>
      <tool-model-selection
        v-if="autoAnnotationOn"
        :editor="editor"
        :models="models"
      />
      <auto-annotate-class-mapper v-if="autoAnnotationOn && !isPreselectedModelAutoAnnotate" />
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
            <span
              v-if="isExternal"
              v-tooltip="externalTooltip"
              class="workflow-top-bar__external"
            >
              EXTERNAL
            </span>
            <span
              v-if="isDicom"
              class="workflow-top-bar__dicom"
            >
              DICOM
            </span>
            <span
              v-if="isPdf"
              class="workflow-top-bar__pdf"
            >
              PDF
            </span>
          </div>
          <workflow-pagination />
        </div>
        <workflow-warning v-if="showTracker" />
      </div>
    </template>
    <template
      v-if="selectedDatasetItem"
      #right
    >
      <workflow-tracker v-if="showTracker" />
      <stages />
      <div class="workflow-top-bar__controls">
        <workflow-controls class="workflow-top-bar__controls__buttons" />
        <!--TODO-->
        <!--<v2-action-history-trigger-->
        <!--class="workflow-top-bar__controls__more"-->
        <!--/>-->
      </div>
    </template>
  </top-bar>
</template>

<script lang="ts">
import { ref, defineComponent, computed, onMounted, onBeforeUnmount } from 'vue'

import { useDatasetItem } from '@/components/DatasetManagement/Card/V2/useDatasetItem'
import ClickerCoarseSlider from '@/components/WorkView/ClickerCoarseSlider/ClickerCoarseSlider.vue'
import WorkflowPagination from '@/components/WorkView/Pagination/V2/WorkflowPagination.vue'
import ToolClassSelection from '@/components/WorkView/ToolClassSelection/V2/ToolClassSelection.vue'
import ToolModelSelection from '@/components/WorkView/ToolModelSelection/ToolModelSelection.vue'
import AutoAnnotateSlider from '@/components/WorkView/TopBar/AutoAnnotateSlider/AutoAnnotateSlider.vue'
import Stages from '@/components/WorkView/TopBar/Stages/V2/Stages.vue'
import ToolOptions from '@/components/WorkView/TopBar/ToolOptions/V2/ToolOptions.vue'
import WorkflowControls from '@/components/WorkView/TopBar/WorkflowControls/V2/WorkflowControls.vue'
import AutoAnnotateClassMapper from '@/components/WorkView/TopBar/components/V2/AutoAnnotateClassMapper.vue'
import WorkflowWarning from '@/components/WorkView/TopBar/components/WorkflowWarning.vue'
import WorkflowTracker from '@/components/WorkView/Tracker/WorkflowTracker.vue'
import { usePreselectedModelAutoAnnotate, useSelectedDatasetItemV2 } from '@/composables'
import { useEditorV2 } from '@/composables/useEditorV2'
import { useStore } from '@/composables/useStore'
import {
  DatasetItemPayload
} from '@/store/types'

import TopBar from './TopBar.vue'

export default defineComponent({
  name: 'WorkflowTopBar',
  components: {
    // V2ActionHistoryTrigger,
    AutoAnnotateClassMapper,
    AutoAnnotateSlider,
    ClickerCoarseSlider,
    Stages,
    ToolClassSelection,
    ToolModelSelection,
    ToolOptions,
    TopBar,
    WorkflowControls,
    WorkflowPagination,
    WorkflowTracker,
    WorkflowWarning
  },
  setup (props, context) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }
    const { state } = useStore()
    const isPreselectedModelAutoAnnotate = usePreselectedModelAutoAnnotate()

    const autoAnnotationOn = ref(false)
    const models = computed(() => state.workview.autoAnnotateModels)
    const tutorialMode = computed(() => state.workview.tutorialMode)
    const trackingEnabled = !tutorialMode.value
    const selectedDatasetItem = useSelectedDatasetItemV2()
    const {
      isPdf,
      isDicom,
      isExternal
    } = useDatasetItem({
      dataV2: selectedDatasetItem.value,
      // maybe data and datav2 in the hook should be optional?
      data: {} as DatasetItemPayload
    }, context)
    const showTracker = computed(() => {
      if (!selectedDatasetItem.value) { return false }
      return trackingEnabled
    })
    const externalTooltip = {
      content: [
        'This image is stored on a client server.',
        'It may have a different loading speed than normal depending on your location.'
      ].join(' ')
    }

    const handleToolChange = (name: string): void => {
      autoAnnotationOn.value = name === 'clicker_tool'
    }

    onMounted(() => {
      editor.value.toolManager.addListener('tool:activated', handleToolChange)
    })

    onBeforeUnmount(() => {
      editor.value.toolManager.removeListener('tool:activated', handleToolChange)
    })

    return {
      editor,
      autoAnnotationOn,
      externalTooltip,
      isDicom,
      isExternal,
      isPdf,
      isPreselectedModelAutoAnnotate,
      models,
      selectedDatasetItem,
      showTracker,
      trackingEnabled
    }
  }
})
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
    position: relative;
  }

  &__tags {
    position: absolute;
    top: -5px;
    @include row--center;
  }

  &__external {
    @include typography(sm, default, bold);
    color: $colorDarkYellow;
    cursor: pointer;
  }

  &__dicom,
  &__pdf {
    margin-left: 3px;
    @include typography(sm, default, bold);
    color: $colorAliceNight;
    @include noSelect;
  }

  &__class-selection {
    margin: 0 0 0 8px;
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
