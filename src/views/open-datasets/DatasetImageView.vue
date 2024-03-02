<template>
  <workview
    class="dataset-image-view"
    no-class-dialog
    :editor="editor.value"
    :hotkeys="hotkeys"
    open-work-mode
  >
    <template #top>
      <top-bar>
        <template #center>
          <workflow-pagination :editor="editor.value" />
          <v2-stages v-if="selectedDatasetItem && isVersion2" />
          <stages v-else-if="selectedDatasetItem" />
        </template>
      </top-bar>
    </template>
    <template #left>
      <tool-bar
        class="dataset-image-view__center__toolbar"
        :editor="editor.value"
      />
    </template>
    <template #sticky-bars>
      <workflow-filter
        class="dataset-image-view__filter"
        :class="{
          'dataset-image-view__filter--with-video-tool': showVideoTool
        }"
        :dataset="dataset"
      />
      <video-annotations
        v-if="showVideoTool"
        :editor="editor.value"
      />
    </template>
    <template #bottom>
      <workflow-bottom-bar />
    </template>
    <template #right>
      <div class="dataset-image-view__center__right-container">
        <read-only-layer-bar
          :editor="editor.value"
          class="dataset-image-view__center__layerbar"
        />
        <tag-applier
          v-if="dataset"
          class="dataset-image-view__center__tag-applier"
          disabled
          :editor="editor.value"
        />
      </div>
    </template>
    <workflow-plugin-manager :editor="editor.value" />
    <item-count-loader open-work-mode />
    <items-loader
      v-if="dataset"
      open-work-mode
    />
    <stage-selector v-if="dataset" />
    <stage-annotation-loader v-if="!isWorkflowsV2" />
  </workview>
</template>

<script lang="ts">
import { Component, Vue, Inject, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { WorkflowBottomBar } from '@/components/WorkView/BottomBar'
import {
  OPEN_DATASET_TOOL_HOTKEYS,
  OPEN_DATASET_GENERAL_HOTKEYS
} from '@/components/WorkView/HotkeyInfo/hotkeys'
import { HotkeyCategory } from '@/components/WorkView/HotkeyInfo/types'
import ReadOnlyLayerBar from '@/components/WorkView/LayerBar/ReadOnlyLayerBar.vue'
import WorkflowPagination from '@/components/WorkView/Pagination/WorkflowPagination.vue'
import ItemCountLoader from '@/components/WorkView/Renderless/ItemCountLoader'
import ItemsLoader from '@/components/WorkView/Renderless/ItemsLoader'
import StageAnnotationLoader from '@/components/WorkView/Renderless/StageAnnotationLoader'
import StageSelector from '@/components/WorkView/Renderless/StageSelector'
import WorkflowPluginManager from '@/components/WorkView/Renderless/WorkflowPluginManager'
import TagApplier from '@/components/WorkView/TagApplier/V1/TagApplier.vue'
import ToolBar from '@/components/WorkView/ToolBar/ToolBar.vue'
import Stages from '@/components/WorkView/TopBar/Stages/V1/Stages.vue'
import V2Stages from '@/components/WorkView/TopBar/Stages/V2/Stages.vue'
import TopBar from '@/components/WorkView/TopBar/TopBar.vue'
import VideoAnnotations from '@/components/WorkView/VideoScrubber/VideoAnnotations.vue'
import WorkflowFilter from '@/components/WorkView/WorkflowFilter/WorkflowFilter.vue'
import Workview from '@/components/WorkView/Workview.vue'
import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import {
  DatasetPayload,
  DatasetItemPayload,
  LayoutConfig,
  WorkflowStagePayload,
  AnnotationClassPayload
} from '@/store/types'
import { getDatasetClasses } from '@/utils'

@Component({
  name: 'dataset-image-view',
  components: {
    ItemCountLoader,
    ItemsLoader,
    ReadOnlyLayerBar,
    StageAnnotationLoader,
    Stages,
    V2Stages,
    StageSelector,
    TagApplier,
    ToolBar,
    TopBar,
    VideoAnnotations,
    WorkflowBottomBar,
    WorkflowFilter,
    WorkflowPluginManager,
    WorkflowPagination,
    Workview
  }
})
export default class DatasetImageView extends Vue {
  @Inject()
  editor!: { value?: Editor }

  @State(state => state.workview.currentTool)
  currentTool!: string

  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload | null

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload | null

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  @State(state => state.aclass.classes)
  classes!: AnnotationClassPayload[]

  hotkeys: HotkeyCategory[] = [OPEN_DATASET_GENERAL_HOTKEYS, OPEN_DATASET_TOOL_HOTKEYS]

  mounted (): void {
    if (!this.editor.value) { return }
    this.editor.value.init()

    const unconnect = connectStore(this.$store, this.editor.value)
    this.$once('hook:beforeDestroy', () => { unconnect() })

    const plugins = this.editor.value.pluginManager.pluginsForView()
    this.editor.value.installAllPlugins(plugins)
    this.editor.value.activateTool('select_tool')
  }

  @Watch('editor.value.viewsList', { immediate: true })
  onViews (): void {
    this.onClasses()
  }

  @Watch('classes')
  onClasses (): void {
    const classesToSet = this.dataset ? getDatasetClasses(this.classes, this.dataset.id) : []
    this.editor.value?.viewsList.forEach(view => {
      view.setAnnotationClasses(classesToSet)
    })
  }

  @Watch('layout', { deep: true })
  onViewSectionsChange (layout: LayoutConfig): void {
    if (!this.editor.value?.layout.isSameLayoutConfig(layout)) {
      this.editor.value?.setupLayout(layout)
    }
  }

  get isVersion2 (): boolean {
    return this.$store.getters['dataset/isVersion2']
  }

  get layout (): LayoutConfig {
    const layout = this.selectedDatasetItem?.dataset_video?.metadata.layout

    if (!layout) {
      return {
        type: 'single',
        views: [{
          item: this.selectedDatasetItem
        }]
      }
    }

    return {
      type: layout.name,
      views: layout.groups.map(i => ({
        item: this.selectedDatasetItem,
        framesGroup: i
      }))
    }
  }

  get showVideoTool (): boolean {
    const view = this.editor.value?.activeView
    if (!view) { return false }
    const { isDicomItem, isPdfItem, loadedVideo } = view
    if (!loadedVideo) { return false }
    // Hide video control if loadedVideo is dicom video and has only 1 frame
    return !(isDicomItem || isPdfItem) || Object.keys(loadedVideo.frames).length > 1
  }

  get isWorkflowsV2 (): boolean {
    return this.$featureEnabled('DARWIN_V2_ENABLED')
  }

  get hasDatasetItem (): boolean {
    return this.$store.state.workview.selectedDatasetItem !== null
  }
}
</script>

<style lang="scss" scoped>
.dataset-image-view__filter {
  position: absolute;
  left: 0;
  bottom: 100%;
  max-height: 70vh;
  z-index: var(--workview-filter);
}

.dataset-image-view__filter--with-video-tool {
  max-height: calc(70vh - 100%);
  border-radius: 0;
}

.dataset-image-view__center__right-container {
  width: 100%;
  height: 100%;
  @include col;
}

.dataset-image-view__center__layerbar {
  width: 100%;
  flex: 1 1 auto;
  overflow: hidden;
}

.dataset-image-view__center__tag-applier {
  flex: 0 0 40%;
  max-height: 320px;
}
</style>
