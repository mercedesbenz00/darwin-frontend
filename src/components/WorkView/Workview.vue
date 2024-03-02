<template>
  <div class="workview">
    <div class="workview__top">
      <slot name="top" />
    </div>
    <div class="workview__center">
      <div class="workview__center__left">
        <slot name="left" />
      </div>

      <div
        id="main-view"
        class="workview__center__main"
      >
        <div
          id="workview-canvas"
          class="workview__center__main__layout"
        >
          <layout-component :editor="editor" />

          <comment-thread :view="editor.activeView" />
          <test-stage-results />
          <slot name="main" />
          <resize-observer @notify="setDimensionsAndRedraw" />
        </div>

        <div class="workview__center__main__bottom">
          <div
            class="workview__center__main__bottom__bars"
            :class="{
              'workview__center__main__bottom__bars--stick-bottom': bottomBarCollapsed
            }"
          >
            <slot name="sticky-bars" />
          </div>
          <bottom-drawer
            class="workview__center__main__bottom__images"
            name="image carousel"
            :max-height="150"
            resizable
            @toggle="onToggleBottomDrawer"
          >
            <slot name="bottom" />
          </bottom-drawer>
        </div>
        <instructions-sidebar
          class="workview__center__main__instructions hide-to-sm"
          :open.sync="isInstructionsSidebarOpen"
          @opened="onInstructionsSidebarOpen"
        >
          <instructions
            :annotation-classes="datasetClasses"
            :dataset="dataset"
            @add-class="showClassDialog"
          />
        </instructions-sidebar>

        <hotkey-info-sidebar
          class="workview__center__main__hotkey hide-to-sm"
          :open.sync="isHotkeyInfoSidebarOpen"
          @opened="onHotkeyInfoSidebarOpen"
        >
          <hotkey-info
            ref="hotkeys"
            :hotkeys="hotkeys"
          />
        </hotkey-info-sidebar>

        <image-manipulation-sidebar
          class="workview__center__main__image hide-to-sm"
          :open.sync="isImageManipulationSidebarOpen"
          @opened="onImageManipulationSidebarOpen"
        >
          <image-manipulation
            :editor="editor"
            :is-sidebar-open="isImageManipulationSidebarOpen"
          />
        </image-manipulation-sidebar>

        <template v-if="!isSocketCheckDisabled">
          <tracker-offline-dialog v-if="!isTutorial" />
          <plan-expired-dialog v-if="!isTutorial && isCurrentTeamDataset" />
          <out-of-storage-dialog v-if="!isTutorial && isCurrentTeamDataset" />
        </template>

        <modal
          class="modal__instructions"
          name="modalInstructions"
          :adaptive="true"
          :height="'80%'"
          :max-height="800"
          :min-height="400"
          @closed="closeInstructions"
        >
          <div class="modal__header">
            <button
              class="modal__close-button"
              aria-label="close"
              @click="closeInstructions"
            />
            <strong class="modal__dataset-name">{{ dataset.name }}</strong>
            <p>Here are your instructions for the upcoming task…</p>
          </div>
          <div class="instructions-scroll-container">
            <instructions
              :annotation-classes="datasetClasses"
              :dataset="dataset"
              in-modal
            />
          </div>
        </modal>
      </div>

      <div class="workview__center__right">
        <slot name="right" />
      </div>
    </div>
    <!-- everything else (modals, .etc) -->
    <slot />
    <cursor-loader :editor="editor" />
    <dataset-attribute-loader :open-work-mode="openWorkMode" />
    <dataset-channel-subscriber />
    <workview-class-dialog
      v-if="!noClassDialog"
      ref="classDialog"
      :editor="editor"
    />
    <credits-popup v-if="$can('manage_customer')" />

    <color-maps />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { ResizeObserver } from 'vue-resize'
import { Getter, State } from 'vuex-class'

import OutOfStorageDialog from '@/components/Plans/Product/OutOfStorageDialog.vue'
import PlanExpiredDialog from '@/components/Plans/Product/PlanExpiredDialog.vue'
import { Editor } from '@/engine/editor'
import { ToolManager } from '@/engine/managers'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  DatasetItemPayload,
  DatasetPayload,
  RootState,
  TeamPayload
} from '@/store/types'
import { getDatasetClasses } from '@/utils'
import { resolveVariable } from '@/utils/config'
import { isDatasetInCurrentTeam } from '@/utils/dataset'

import { BottomDrawer } from './BottomDrawer/'
import WorkviewClassDialog from './ClassSelection/WorkviewClassDialog.vue'
import ColorMaps from './ColorMaps.vue'
import CommentThread from './Comment/V1/CommentThread.vue'
import CreditsPopup from './CreditsPopup.vue'
import HotkeyInfo from './HotkeyInfo/HotkeyInfo.vue'
import HotkeyInfoSidebar from './HotkeyInfo/HotkeyInfoSidebar.vue'
import { HotkeyCategory } from './HotkeyInfo/types'
import ImageManipulation from './ImageManipulation/ImageManipulation.vue'
import ImageManipulationSidebar from './ImageManipulation/ImageManipulationSidebar.vue'
import Instructions from './Instructions/Instructions.vue'
import InstructionsSidebar from './Instructions/InstructionsSidebar.vue'
import LayoutComponent from './Layout'
import CursorLoader from './Renderless/CursorLoader'
import DatasetAttributeLoader from './Renderless/DatasetAttributeLoader'
import DatasetChannelSubscriber from './Renderless/DatasetChannelSubscriber'
import TestStageResults from './TestStageResults.vue'
import TrackerOfflineDialog from './Tracker/TrackerOfflineDialog.vue'

/**
 * Base layout for all image annotation views used in the app
 *
 * This components defines sections of the UI and slots to be filled in by other components
 *
 * The slots are
 *
 * - top - full-width bar at the top of the page
 * - left - toolbar on the left side of the page
 * - right - toolbar on the right side of the page
 * - bottom - drawer on the bottom of the page
 * - main - area floating on top of the main canvas
 * - an unnamed slot, to be used for modals, etc.
 *
 * Used as follows
 *
 * ```
 * <workview :editor="editor" :selected-image="selectedImage">
 *   <template v-slot:top>{content for top}</template>
 *   <template v-slot:left>{content for left}</template>b
 *   <template v-slot:right>{content for right}</template>
 *   <template v-slot:main>{content for main}</template>
 *   <template v-slot:bottom>{content for bottom}</template>
 *   {other content, modals, etc.}
 * </workview>
 * ```
 */
@Component({
  name: 'workview',
  components: {
    CommentThread,
    BottomDrawer,
    CreditsPopup,
    CursorLoader,
    DatasetAttributeLoader,
    DatasetChannelSubscriber,
    HotkeyInfo,
    HotkeyInfoSidebar,
    ImageManipulation,
    ImageManipulationSidebar,
    Instructions,
    InstructionsSidebar,
    OutOfStorageDialog,
    PlanExpiredDialog,
    ResizeObserver,
    TestStageResults,
    TrackerOfflineDialog,
    WorkviewClassDialog,
    LayoutComponent,
    ColorMaps
  }
})
export default class Workview extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @Prop({ required: true })
  hotkeys!: HotkeyCategory[]

  @Prop({ type: Boolean, default: false })
  noClassDialog!: boolean

  @Prop({ type: Boolean, default: false })
  openWorkMode!: boolean

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @State((state: RootState) => state.ui.workviewBottomBarCollapsed)
  bottomBarCollapsed!: boolean

  @State(state => state.workview.tutorialMode)
  isTutorial!: boolean

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  @State((state: RootState) => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  @Getter('selectedAnnotation', { namespace: 'workview' })
  selectedAnnotation!: StageAnnotation | null

  isInstructionsSidebarOpen: boolean = false
  isHotkeyInfoSidebarOpen: boolean = false
  isImageManipulationSidebarOpen: boolean = false

  $refs!: {
    classDialog: WorkviewClassDialog
  }

  get datasetClasses (): AnnotationClassPayload[] {
    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get toolManager (): ToolManager {
    return this.editor.toolManager
  }

  get isCurrentTeamDataset (): boolean {
    return isDatasetInCurrentTeam(this.dataset, this.currentTeam)
  }

  get isSocketCheckDisabled (): boolean {
    const disabled = resolveVariable(
      process.env.VUE_APP_DISABLED_SOCKET_CHECK,
      '$DISABLED_SOCKET_CHECK'
    ) as string
    return !!disabled && disabled === '1'
  }

  public mounted (): void {
    const userAgents = ['Android', 'iPad', 'iPhone']
    if (userAgents.some(userAgent => navigator.userAgent.includes(userAgent))) {
      this.$store.commit('workview/SHOW_MOBILE_BUTTONS')
    }

    // Load memberships if the user is authorized to do so
    if (this.$can('view_team_members')) {
      this.$store.dispatch('team/getMemberships')
    }

    this.$store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
    this.$once('hook:beforeDestroy', () => this.$store.dispatch('ui/reloadSidebarStatus'))

    // Load presets from local storage
    this.$store.dispatch('workview/loadPresets')
  }

  @Watch('editor.activeView.isPdfItem')
  onPdfItem (value: boolean) {
    if (!value) { return }

    if (this.$store.getters['features/isFeatureEnabled']('DOCUMENTS')) {
      this.$store.commit('workview/SET_VIDEO_ANNOTATION_DURATION', 1)
    }
  }

  beforeDestroy (): void {
    this.editor.cleanup()
  }

  resetDimensions (): void {
    this.editor.layout.updateViewsCameraDimensions()
  }

  setDimensionsAndRedraw (): void {
    this.resetDimensions()
    this.redraw()
  }

  redraw (): void {
    this.editor.viewsList.forEach(view => {
      view.allLayersChanged()
    })
  }

  closeInstructions (): void {
    this.$store.commit('workview/CLOSE_INSTRUCTIONS')
  }

  @Watch('$store.state.workview.instructionsIsOpen')
  onInstructionsIsOpen (isOpen: boolean): void {
    if (isOpen) {
      this.editor.deactivateCallbacks()
      this.$modal.show('modalInstructions')
    } else {
      this.editor.activateCallbacks()
      this.$modal.hide('modalInstructions')
    }
  }

  onInstructionsSidebarOpen (): void {
    this.isHotkeyInfoSidebarOpen = false
    this.isImageManipulationSidebarOpen = false
  }

  onHotkeyInfoSidebarOpen (): void {
    this.isInstructionsSidebarOpen = false
    this.isImageManipulationSidebarOpen = false
  }

  onImageManipulationSidebarOpen (): void {
    this.isInstructionsSidebarOpen = false
    this.isHotkeyInfoSidebarOpen = false
  }

  showClassDialog (): void {
    this.$refs.classDialog.show()
  }

  onToggleBottomDrawer (collapsed: boolean): void {
    this.$store.commit('ui/SET_WORKVIEW_BOTTOM_BAR_COLLAPSED', collapsed)
  }

  // Reset the list of annotation types for edit_tool when selected annotation changes
  // to reset the list of annotation classes in the topbar properly
  @Watch('selectedAnnotation')
  onSelectedAnnotationChange (): void {
    const { currentTool } = this.editor.toolManager

    if (currentTool && currentTool.name === 'edit_tool') {
      const { editor, selectedAnnotation } = this
      const types = editor.toolManager.currentAnnotationTypes()
      this.$store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)
      this.$store.commit(
        'workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE',
        selectedAnnotation ? selectedAnnotation.annotation_class_id : null
      )
    }
  }
}
</script>

<style src="./workview-cursor.scss" lang="scss" scoped></style>

<style lang="scss" scoped>
$top_height: 54px;
$left_width: 44px;
$right_width: 250px;

.workview {
  position: fixed;
  display: grid;
  grid-template-rows: $top_height 1fr;
  @include fullsize;
  overflow: hidden;

  &__top {
    padding-top: 1px;
    height: $top_height;
    z-index: var(--workview-top);
  }

  &__center {
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: auto calc(100vw - $left_width - $right_width) auto;
    overflow: hidden;

    &__main {
      position: relative;
      display: grid;
      grid-template-rows: 1fr auto;
      grid-template-columns: 100%;
      background-color: #dde4f1;
      width: 100%;
      z-index: var(--workview-center-main);

      &__layout {
        position: relative;
        width: 100%;
        height: 100%;
      }

      &__instructions {
        z-index: var(--workview-center-main-instructions);
      }
      &__hotkey {
        z-index: var(--workview-center-main-hotkey);
      }
      &__image {
        z-index: var(--workview-center-main-image);
      }

      &__bottom {
        max-width: 100%;
        z-index: var(--workview-center-main-bottom);

        &__bars {
          position: relative;
          width: 100%;
          overflow: visible;

          &--stick-bottom {
            bottom: 0;
          }
        }

        &__images {
          z-index: var(--workview-bottom-images) !important;

          :deep(.bottom-drawer__toggle-button) {
            margin-left: 0px;
          }
        }
      }
    }

    &__right {
      width: $right_width;
      height: 100%;
      z-index: var(--workview-center-right);
    }

    &__left {
      width: $left_width;
      z-index: var(--workview-center-left);
    }
  }
}

.modal__dataset-name {
  width: 100%;
  @include ellipsis(1, xl);
  @include typography(xl, default, bold);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

ul li {
  padding: 2vh 1vw;
}

ul li:nth-child(2n) {
  background: rgb(250, 250, 255);
}

ul li:hover {
  font-weight: 500;
}

ul li span:first-child svg {
  float: left;
  margin-left: 0.5vw;
  margin-right: 1.2vw;
  width: 10%;
  height: auto;
  line-height: auto;
  fill: currentColor;
  stroke: currentColor;
  overflow: visible;
}

ul li span:last-child svg {
  float: right;
  margin-right: 0.5vw;
  width: 1.5vw;
  height: auto;
  line-height: auto;
}

ul li.undecorated span svg {
  width: 12%;
}

span.text {
  float: left;
}
</style>
