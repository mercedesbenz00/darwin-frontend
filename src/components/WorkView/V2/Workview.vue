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

          <Thread v-if="isCommentsV2" />
          <comment-thread v-else />
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
            <strong
              v-if="dataset"
              class="modal__dataset-name"
            >{{ dataset.name }}</strong>
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
import {
  defineComponent,
  watch,
  computed,
  ref,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { ResizeObserver } from 'vue-resize'

import OutOfStorageDialog from '@/components/Plans/Product/OutOfStorageDialog.vue'
import PlanExpiredDialog from '@/components/Plans/Product/PlanExpiredDialog.vue'
import { BottomDrawer } from '@/components/WorkView/BottomDrawer'
import WorkviewClassDialog from '@/components/WorkView/ClassSelection/WorkviewClassDialog.vue'
import ColorMaps from '@/components/WorkView/ColorMaps.vue'
import CommentThread from '@/components/WorkView/Comment/V2/CommentThread.vue'
import Thread from '@/components/WorkView/Comment/V2/Thread/Thread.vue'
import CreditsPopup from '@/components/WorkView/CreditsPopup.vue'
import HotkeyInfo from '@/components/WorkView/HotkeyInfo/HotkeyInfo.vue'
import HotkeyInfoSidebar from '@/components/WorkView/HotkeyInfo/HotkeyInfoSidebar.vue'
import { HotkeyCategory } from '@/components/WorkView/HotkeyInfo/types'
import ImageManipulationSidebar from '@/components/WorkView/ImageManipulation/ImageManipulationSidebar.vue'
import ImageManipulation from '@/components/WorkView/ImageManipulation/V2/ImageManipulation.vue'
import Instructions from '@/components/WorkView/Instructions/Instructions.vue'
import InstructionsSidebar from '@/components/WorkView/Instructions/InstructionsSidebar.vue'
import { Layout as LayoutComponent } from '@/components/WorkView/Layout/V2'
import CursorLoader from '@/components/WorkView/Renderless/CursorLoader'
import DatasetAttributeLoader from '@/components/WorkView/Renderless/DatasetAttributeLoader'
import DatasetChannelSubscriber from '@/components/WorkView/Renderless/DatasetChannelSubscriber'
import TestStageResults from '@/components/WorkView/TestStageResults.vue'
import TrackerOfflineDialog from '@/components/WorkView/Tracker/TrackerOfflineDialog.vue'
import { useAuth, useFeatureFlags, useModal, useStore } from '@/composables'
import { useCommentLoader } from '@/composables/useCommentLoader'
import { Editor } from '@/engineV2/editor'
import { ToolManager } from '@/engineV2/managers'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'
import { getDatasetClasses } from '@/utils'
import { resolveVariable } from '@/utils/config'
import { isDatasetInCurrentTeam } from '@/utils/dataset'

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
export default defineComponent({
  name: 'V2Workview',
  components: {
    CommentThread,
    Thread,
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
  },
  props: {
    editor: { required: true, type: Object as () => Editor },
    hotkeys: { required: true, type: Array as () => HotkeyCategory[] },
    noClassDialog: { type: Boolean, default: false },
    openWorkMode: { type: Boolean, default: false }
  },
  setup (props) {
    const { state, getters, commit, dispatch } = useStore()
    const { isAuthorized } = useAuth()
    const modal = useModal()

    useCommentLoader()

    const dataset = computed(() => state.workview.dataset)
    const instructionsIsOpen = computed(() => state.workview.instructionsIsOpen)
    const annotationClasses = computed(() => state.aclass.classes)
    const bottomBarCollapsed = computed(() => state.ui.workviewBottomBarCollapsed)
    const isTutorial = computed(() => state.workview.tutorialMode)
    const currentTeam = computed(() => state.team.currentTeam)
    const selectedDatasetItem = computed(() => state.workview.selectedDatasetItem)
    const selectedAnnotation = computed(
      (): StageAnnotation | null => getters['workview/selectedAnnotation']
    )

    const isInstructionsSidebarOpen = ref(false)
    const isHotkeyInfoSidebarOpen = ref(false)
    const isImageManipulationSidebarOpen = ref(false)

    const classDialog = ref<InstanceType<typeof WorkviewClassDialog>>()

    const datasetClasses = computed((): AnnotationClassPayload[] => (
      dataset.value
        ? getDatasetClasses(annotationClasses.value, dataset.value.id)
        : []
    ))

    const toolManager = computed((): ToolManager => props.editor.toolManager)

    const isCurrentTeamDataset = computed((): boolean =>
      dataset.value
        ? isDatasetInCurrentTeam(dataset.value, currentTeam.value)
        : false
    )

    const isSocketCheckDisabled = computed((): boolean => {
      const disabled = resolveVariable(
        process.env.VUE_APP_DISABLED_SOCKET_CHECK,
        '$DISABLED_SOCKET_CHECK'
      ) as string
      return !!disabled && disabled === '1'
    })

    onMounted((): void => {
      const userAgents = ['Android', 'iPad', 'iPhone']
      if (userAgents.some(userAgent => navigator.userAgent.includes(userAgent))) {
        commit('workview/SHOW_MOBILE_BUTTONS')
      }

      commit('dataset/SET_CURRENT_DATASET_ID', dataset.value?.id)

      // Load memberships if the user is authorized to do so
      if (isAuthorized('view_team_members')) {
        dispatch('team/getMemberships')
      }

      commit('ui/SET_SIDEBAR_MINIMIZED', true)

      // Load presets from local storage
      dispatch('workview/loadPresets')
    })

    onBeforeUnmount(() => {
      props.editor.cleanup()
      dispatch('ui/reloadSidebarStatus')
    })

    const resetDimensions = (): void => {
      props.editor.layout.updateViewsCameraDimensions()
    }

    const redraw = (): void => {
      props.editor.viewsList.forEach(view => {
        view.allLayersChanged()
      })
    }

    const setDimensionsAndRedraw = (): void => {
      resetDimensions()
      redraw()
    }

    const closeInstructions = (): void => {
      commit('workview/CLOSE_INSTRUCTIONS')
    }

    const onInstructionsSidebarOpen = (): void => {
      isHotkeyInfoSidebarOpen.value = false
      isImageManipulationSidebarOpen.value = false
    }

    const onHotkeyInfoSidebarOpen = (): void => {
      isInstructionsSidebarOpen.value = false
      isImageManipulationSidebarOpen.value = false
    }

    const onImageManipulationSidebarOpen = (): void => {
      isInstructionsSidebarOpen.value = false
      isHotkeyInfoSidebarOpen.value = false
    }

    const showClassDialog = (): void => {
      classDialog.value?.show()
    }

    const onToggleBottomDrawer = (collapsed: boolean): void => {
      commit('ui/SET_WORKVIEW_BOTTOM_BAR_COLLAPSED', collapsed)
    }

    // Reset the list of annotation types for edit_tool when selected annotation changes
    // to reset the list of annotation classes in the topbar properly
    watch(selectedAnnotation, () => {
      const { currentTool } = props.editor.toolManager

      if (currentTool && currentTool.name === 'edit_tool') {
        const types = props.editor.toolManager.currentAnnotationTypes()
        commit('workview/SET_TOOL_ANNOTATION_TYPES', types)
        commit(
          'workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE',
          selectedAnnotation.value ? selectedAnnotation.value.annotation_class_id : null
        )
      }
    })

    watch(
      instructionsIsOpen,
      (isOpen: boolean): void => {
        if (isOpen) {
          props.editor.activeView.deactivateCallbacks()
          modal.show('modalInstructions')
        } else {
          props.editor.activeView.activateCallbacks()
          modal.hide('modalInstructions')
        }
      },
      { immediate: true }
    )

    const { featureEnabled } = useFeatureFlags()

    const isCommentsV2 = computed((): boolean =>
      featureEnabled('COMMENTS_V2')
    )

    return {
      isCommentsV2,
      dataset,
      bottomBarCollapsed,
      classDialog,
      datasetClasses,
      toolManager,
      selectedDatasetItem,
      isCurrentTeamDataset,
      isInstructionsSidebarOpen,
      isHotkeyInfoSidebarOpen,
      isImageManipulationSidebarOpen,
      isSocketCheckDisabled,
      isTutorial,
      setDimensionsAndRedraw,
      closeInstructions,
      onInstructionsSidebarOpen,
      onHotkeyInfoSidebarOpen,
      onImageManipulationSidebarOpen,
      showClassDialog,
      onToggleBottomDrawer
    }
  }
})
</script>

<style src="@/components/WorkView/workview-cursor.scss" lang="scss" scoped></style>

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
