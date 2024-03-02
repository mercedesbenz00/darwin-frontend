<template>
  <main
    @mousedown="maybeGrab"
    @mouseup="checkUserDragged"
    ref="layout"
    class="layout-container"
    id="layout-container"
  >
    <div
      v-if="loading"
      class="loading-overlay"
    >
      <GridLoader />
    </div>
    <slot
      v-if="!loading"
      name="playground-area-content"
    />
    <DataPane
      v-if="dataInWorkflowEnabled && !loading"
      class="layout-container__data"
    />
    <sidebar v-if="!loading">
      <slot name="sidebar-content" />
    </sidebar>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref, watch } from 'vue'

import { GridLoader } from '@/components/Common/LoadingIndicators'
import { Sidebar } from '@/components/Workflow/Sidebar'
import { useFeatureFlags } from '@/composables'
import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

import DataPane from './DataPane.vue'

export default defineComponent({
  components: {
    DataPane,
    GridLoader,
    Sidebar
  },
  props: {
    loading: { type: Boolean, required: false, default: false }
  },
  setup (props, { emit }) {
    const store = useStore()
    const scene = useWorkflowSceneStore()
    const features = useFeatureFlags()

    const playground = ref<HTMLElement | null>(null)
    const playgroundFrame = ref<HTMLElement | null>(null)

    const playgroundContent = ref<HTMLElement | null>(null)

    const zoom = ref({ x: 0, y: 0, s: 1 })

    const style = computed(() => ({
      transform:
        `translate(${zoom.value.x}px,${zoom.value.y}px) scale(${zoom.value.s},${zoom.value.s})`
    }))

    const setZoom = (args: { x: number; y: number; s: number }): void => {
      zoom.value = args
      scene.setZoomScale(args.s)
    }

    const dragable = ref(false)

    const compareTargets = (e: MouseEvent): void => {
      dragable.value =
        e.target === playground.value ||
        e.target === playgroundContent.value ||
        e.target === playgroundFrame.value
    }

    const drag = ref({ x: 0, y: 0 })

    /**
     * Controls only deactivating/deselecting of Canvas Stages.
     * Activation is build on component level
     */
    const maybeGrab = (ev: MouseEvent): void => {
      if (ev.target === playgroundContent.value) {
        drag.value.x = ev.clientX
        drag.value.y = ev.clientY
      }
    }

    const checkUserDragged = (e: MouseEvent): void => {
      const wasDragged = drag.value.x !== e.clientX || drag.value.y !== e.clientY
      drag.value.x = 0
      drag.value.y = 0

      if (!wasDragged) {
        emit('select-stage', null)
      }
    }

    const centerStages = (): void => {
      if (!playground.value) { return }
      if (!store.state.v2Workflow.editedWorkflow) { return }

      const [topLeft] = store.state.v2Workflow.editedWorkflow.stages
        .filter(s => s.config.x !== null && s.config.y !== null)
        .sort((a, b) => (a.config.x + a.config.y) - (b.config.x + b.config.y))

      if (!topLeft) { return }

      playground.value.scrollTo(topLeft.config.x - 50, topLeft.config.y - 50)
    }

    watch(() => props.loading, (loading) => {
      if(loading) { return }
      nextTick(() => {
        centerStages()
      })
    }, { immediate: true })

    const dataInWorkflowEnabled = computed(() =>  features.featureEnabled('DATA_IN_WORKFLOW_V2'))

    return {
      checkUserDragged,
      compareTargets,
      dataInWorkflowEnabled,
      dragable,
      maybeGrab,
      playground,
      playgroundContent,
      playgroundFrame,
      setZoom,
      style
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

$canvasBaseBorderRadius: 16px;
$canvasBaseSize: 6000px;

.layout-container {
  position: relative;

  display: block;
  width: 100%;
  height: 100%;
  cursor: inherit;

  overflow: hidden;
  border-radius: $canvasBaseBorderRadius;
  border: 1px solid $colorNeutralsLight300;
  background-color: $colorSurfaceElevate;

  z-index: var(--z-workflow-base);
}

.loading-overlay {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: var(--z-workflow-loading-overlay);
}

.layout-container__data {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 304px;
  z-index: var(--z-workflow-container-data);
}
</style>
