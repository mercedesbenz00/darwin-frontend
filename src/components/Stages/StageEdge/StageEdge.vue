<template>
  <div
    ref="edgeEl"
    :id="nodeId"
    role="presentation"
    class="edge-outer"
    :class="{ dragging: !!dragState }"
    :style="{
      '--edgeColor': edgeColor.default,
      '--edgeColorFocus': edgeColor.focus
    }"
  >
    <div
      class="edge-inner"
      :class="{
        pulse: !isConnected && !dragState,
        connected: isConnected
      }"
    />
    <div
      role="button"
      class="edge-trigger"
      @mousedown.stop="initiateDrag"
    />
    <GhostLine
      v-if="!!dragState"
      :start-id="nodeId"
      :start-type="type"
      :start-x="dragState.startX"
      :start-y="dragState.startY"
      :x="dragState.x"
      :y="dragState.y"
      :zoom-scale="scale"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, nextTick } from 'vue'

import GhostLine from '@/components/Stages/GhostLine.vue'
import { SIDE } from '@/components/WorkflowCreation/Grid/PathFinder'
import { useGridStore } from '@/components/WorkflowCreation/Grid/useGridStore'
import { useStore } from '@/composables/useStore'
import { CREATE_EDGE } from '@/store/modules/V2Workflow/mutations/CREATE_EDGE'
import { REMOVE_EDGE } from '@/store/modules/V2Workflow/mutations/REMOVE_EDGE'
import { V2WorkflowEdgePayload, StageType, StoreMutationPayload } from '@/store/types'
import { StageTheme, stageTheme } from '@/utils/workflowStageTheme'

import { EdgeType } from './types'

type EdgeColor = {
  default: StageTheme['edgeColor']
  focus: StageTheme['edgeColorFocus']
}

type DragState = {
  startX: number
  startY: number
  x: number
  y: number
}

/**
 * Renders an in or out connector on a stage
 * Handles what happens when you start tragging from one connector to another,
 * as well as when you finish the drag and potentially connect the stage.
 */
export default defineComponent({
  components: { GhostLine },
  props: {
    scale: { type: Number, required: true },
    stageId: { type: String, required: true },
    name: { type: String, required: false, default: 'default' },
    edge: { type: Object as () => V2WorkflowEdgePayload | null, required: false, default: null },
    edgeType: { type: String as () => EdgeType, required: true },
    type: { type: String as () => StageType, required: true }
  },
  setup (props) {
    const store = useStore()
    const gridStore = useGridStore()
    if (!gridStore) { throw new Error("Can't get grid store!") }

    const { setEdgePosition } = gridStore

    /**
     * ID of the root element. Used when dragging to or dragging from other edge,
     * contains information about the stage id, edge name and edge type (in or out)
     */
    const nodeId = computed(() => `${props.stageId}_${props.name}_${props.edgeType}`)

    const edgeColor = computed<EdgeColor>(() => {
      return {
        default: stageTheme[props.type].edgeColor,
        focus: stageTheme[props.type].edgeColorFocus
      }
    })

    const dragState = ref<DragState | null>(null)
    const dragStart = { x: 0, y: 0 }

    // On edge dragging highlights StageTemplate.vue container
    // as drop area
    const updateDragState = (e: MouseEvent): void => {
      const target = e.target
      if (!target) { return }

      const container = (target as HTMLElement)
        .closest('.stage__container')
      if (container) { // Gets closest stage__container and highlights it
        container.classList.add('stage__active')
      } else { // Target has no stage__container
        // Search for active stage__container
        const active = (document.body.querySelector(
          '.stage__container.stage__active'
        ) as HTMLElement)
        // Has active stage__container, remove active class
        if (active) {
          active.classList.remove('stage__active')
        }
      }

      dragState.value = {
        startX: dragStart.x,
        startY: dragStart.y,
        x: e.pageX,
        y: e.pageY
      }
    }

    const removeEdge = (payload: StoreMutationPayload<typeof REMOVE_EDGE>): void =>
      store.commit('v2Workflow/REMOVE_EDGE', payload)

    const completeDrag = (e: MouseEvent): void => {
      dragState.value = null
      const active = (document.body.querySelector(
        '.stage__container .stage__active'
      ) as HTMLElement)
      if (active) {
        active.classList.remove('stage__active')
      }

      document.body.removeEventListener('mousemove', updateDragState)
      document.body.removeEventListener('mouseup', completeDrag)

      const target = e.target
      if (!target) { return }

      // we look for the nearest parent with the .edge-outer class
      // this is the element that has the id holding the data about the target edge
      // const closest = (target as HTMLElement).closest('.edge-outer')
      let closest: Element | null = (target as HTMLElement)
        .closest('.edge-outer')

      if (!closest) {
        closest = (target as HTMLElement)
          .closest('.stage__container')
          ?.querySelector('.edge-outer') || null
        if (!closest) { return }
      }

      const id = closest.id

      if (!id) { return }
      if (props.edgeType === EdgeType.IN && !id.includes('_out')) { return }
      if (props.edgeType === EdgeType.OUT && !id.includes('_in')) { return }

      const [otherId, otherName,] = id.split('_')
      if (!otherId || props.stageId === otherId) { return }

      const name = props.edgeType === EdgeType.OUT ? props.name : otherName

      const [sourceId, targetId] = (props.edgeType === EdgeType.OUT)
        ? [props.stageId, otherId]
        : [otherId, props.stageId]

      const newEdge: StoreMutationPayload<typeof CREATE_EDGE> = {
        stageId: sourceId,
        name,
        source_stage_id: sourceId,
        target_stage_id: targetId
      }

      if (props.edgeType === EdgeType.IN) {
        // remove the old edge that might target completely different stage
        removeEdge({
          sourceStageId: sourceId,
          name
        })
      }

      store.commit('v2Workflow/CREATE_EDGE', newEdge)

    }

    const initiateDrag = (e: MouseEvent & TouchEvent): void  => {
      if (e instanceof MouseEvent && e.which !== 1) {
        return
      }

      dragStart.x = e.pageX
      dragStart.y = e.pageY
      document.body.removeEventListener('mousemove', updateDragState)
      document.body.removeEventListener('mouseup', completeDrag)

      document.body.addEventListener('mouseup', completeDrag)
      document.body.addEventListener('mousemove', updateDragState)

      if (props.edgeType === EdgeType.OUT && props.edge) {
        removeEdge({
          sourceStageId: props.edge!.source_stage_id,
          targetStageId: props.edge!.target_stage_id
        })
      }

      if (props.edgeType === EdgeType.IN) {
        removeEdge({ targetStageId: props.stageId })
      }
    }

    const edgeEl = ref()

    watch(nodeId, () => {
      nextTick(() => {
        if (!edgeEl.value) { return }

        setEdgePosition(
          nodeId.value,
          {
            x: edgeEl.value.offsetLeft,
            y: edgeEl.value.offsetParent?.offsetParent?.offsetTop || 0
          },
          props.edgeType === EdgeType.IN ? SIDE.LEFT : SIDE.RIGHT
        )
      })
    }, { immediate: true })

    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)
    const isConnected = computed(() =>
      !!workflow.value?.stages.find(stage =>
        stage.edges.find(edge =>
          (props.edgeType === EdgeType.IN && edge?.target_stage_id === props.stageId) ||
          (props.edgeType === EdgeType.OUT && edge?.source_stage_id === props.stageId) &&
          props.edge
        )
      )
    )

    return {
      isConnected,
      edgeEl,
      dragState,
      edgeColor,
      initiateDrag,
      nodeId
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang='scss'>
@import "./stages";

// Need to manipulate 3rd party css class z-index.
.leader-line {
  z-index: var(--z-workflow-leader-lines);
}
</style>

<style lang="scss" scoped>
.edge-outer {
  transition: border 175ms ease, background-color 175ms ease;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 14px;
  height: 14px;
  background-color: $colorNeutralsLightWhite;
  border-radius: 100%;

  cursor: grab;
}

.dragging {
  background-color: var(--edgeColor);
  cursor: inherit;

  & > .edge-inner {
    background-color: $colorNeutralsLightWhite;
    border-color: $colorNeutralsLightWhite;
  }
}

.edge-outer[data-connected='true'] {
  background-color: var(--edgeColor);
}

.edge-outer[data-connected='true'] .edge-inner {
  border: 2px solid $colorNeutralsLightWhite;
  background-color: var(--edgeColor);
}

.edge-outer[data-connected='true']:hover {
  background-color: var(--edgeColorFocus);
}

.edge-outer[data-connected='true']:hover .edge-inner {
  border: 2px solid $colorNeutralsLightWhite;
  background-color: var(--edgeColorFocus);
}

.edge-inner {
  transition: border 175ms ease, background-color 175ms ease;

  display: block;
  width: 10px;
  height: 10px;
  border: 2px solid $colorNeutralsLight300;
  border-radius: 100%;
  background-color: $colorNeutralsLightWhite;

  pointer-events: none;

  &.connected {
    border-color: var(--edgeColor);
  }
}

.edge-outer:hover .edge-inner {
  border: 2px solid var(--edgeColor);
}

.edge-trigger {
  position: absolute;
  margin: auto;

  background: transparent;
  width: 30px;
  height: 30px;
}

.pulse {
  animation: animate 1s linear infinite;
}

@keyframes animate {
  0% {
    border-color: var(--edgeColor);
  }
  100% {
    border-color: $colorNeutralsLight300;
  }
}
</style>
