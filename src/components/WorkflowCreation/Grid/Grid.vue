<template>
  <div
    ref="gridEl"
    class="grid"
  >
    <Zoom
      :is-max="isMaxZoom"
      :is-min="isMinZoom"
      @inc="incZoom"
      @dec="decZoom"
    />

    <div
      v-if="!loading"
      ref="gridContentEl"
      id="playground-content"
      class="grid__content"
      @click="onBgClick"
    >
      <div
        v-show="!hidePaths"
        :style="{
          pointerEvents: 'none',
          position: 'absolute',
          left: `${box.minX}px`,
          top: `${box.minY}px`,
          width: `${box.maxX - box.minX}px`,
          height: `${box.maxY - box.minY}px`,
        }"
      >
        <svg
          v-for="(path, index) in paths"
          :key="index"
          xmlns="http://www.w3.org/2000/svg"
          class="path"
          :style="{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: hoverOn === index ? 1 : 0,
            width: '100%',
            height: '100%'
          }"
        >
          <path
            :d="path.path"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            @mouseover="() => hoverOn = index"
            @mouseleave="() => hoverOn = null"
            :style="{
              pointerEvents: 'all'
            }"
            :stroke="path.color"
          />
        </svg>
      </div>

      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import panzoom, { PanZoom } from 'panzoom'
import {
  defineComponent,
  computed,
  ref,
  nextTick,
  watch,
  onBeforeUnmount
} from 'vue'

import { Zoom } from '@/components/Workflow/Zoom'
import PathFinder, { SIDE } from '@/components/WorkflowCreation/Grid/PathFinder'
import { useStore } from '@/composables'
import { Point } from '@/engineCommon/point'
import { StageType, V2WorkflowEdgePayload } from '@/store/types'
import { stageTheme } from '@/utils/workflowStageTheme'

import { ItemBBox } from './types'
import { useProvideGridStore } from './useGridStore'
import { createRoundedPath } from './utils'

const cellWidth = 20
const cellHeight = 20

enum CELL_STATE {
  BUSY = 1,
  EMPTY = 0
}

export default defineComponent({
  name: 'Grid',
  components: { Zoom },
  props: {
    edges: {
      type: Array as () => V2WorkflowEdgePayload[],
      required: true
    },
    loading: { type: Boolean }
  },
  setup (props, { emit }) {
    const store = useStore()
    let inited = false
    const gridEl = ref()
    const gridContentEl = ref()

    const itemBBoxes = ref<{ [key: string]: ItemBBox }>({})

    const getCellBBox = (rowIndex: number, cellIndex: number): any => {
      const minX = (cellIndex * cellWidth)
      const maxX = (cellIndex * cellWidth) + cellWidth
      const minY = (rowIndex * cellHeight)
      const maxY = (rowIndex * cellHeight) + cellHeight

      return {
        minX,
        maxX,
        minY,
        maxY
      }
    }

    const box = computed((): any =>
      [...Object.values(itemBBoxes.value)].reduce((acc, item) => {
        const minX = Math.min(item.x, acc.minX) - (cellWidth * 2)
        const maxX = Math.max(item.x + item.width, acc.maxX) + (cellWidth * 2)
        const minY = Math.min(item.y, acc.minY) - (cellHeight * 2)
        const maxY = Math.max(item.y + item.height, acc.maxY) + (cellHeight * 2)
        return {
          minX: minX - (minX % cellWidth),
          maxX: maxX - (maxX % cellWidth),
          minY: minY - (minY % cellHeight),
          maxY: maxY - (maxY % cellHeight)
        }
      }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })
    )

    const isCellBusy = (rowIndex: number, cellIndex: number): boolean => {
      const { minX, maxX, minY, maxY } = getCellBBox(rowIndex, cellIndex)

      const res = !![...Object.values(itemBBoxes.value)].find(({ x, y, width, height })=> {
        return (
          (box.value.minX + minX) >= x - cellWidth &&
          (box.value.minY + minY) >= y - cellHeight &&
          (box.value.minX + maxX) <= (x + width) + cellWidth &&
          (box.value.minY + maxY) <= (y + height) + cellHeight
        )
      })
      return res
    }

    const matrix = ref<number[][]>([[]])

    const grid = ref<PathFinder>()

    const calcGridDebounce = debounce((): void => {
      const width  = Math.ceil((box.value.maxX - box.value.minX) / cellWidth)
      const height = Math.ceil((box.value.maxY - box.value.minY) / cellHeight)

      if (
        !width || !height ||
        width === Infinity || width === -Infinity ||
        height === Infinity || height === -Infinity
      ) {
        matrix.value = [[]]
        return
      }

      matrix.value = (Array(height).fill(Array(width).fill(null))).map((row, rowIndex: number) =>
        row.map((_: never, cellIndex: number) => {
          return isCellBusy(rowIndex, cellIndex) ? CELL_STATE.BUSY : CELL_STATE.EMPTY
        })
      )

      grid.value = new PathFinder()
      grid.value.setGrid(matrix.value)
      grid.value.setAcceptableTiles([CELL_STATE.EMPTY, CELL_STATE.BUSY])
      grid.value.setTileCost(CELL_STATE.BUSY, 6)
    }, 100)

    watch(() => box.value, calcGridDebounce, { immediate: true })

    const panZoomInstance = ref<PanZoom>()

    const centerStages = (): void => {
      if (!panZoomInstance.value) { return }

      const [topLeft] = Object.values(itemBBoxes.value)
        .filter((i: ItemBBox) => i.x !== null && i.y !== null)
        .sort((a: ItemBBox, b: ItemBBox) => (a.x + a.y) - (b.x + b.y))

      if (!topLeft) { return }

      panZoomInstance.value.smoothMoveTo(
        -topLeft.x,
        -topLeft.y
      )
    }

    const edgePositions = ref<{ [key: string]: any }>({})

    const hidePaths = ref(false)

    const scale = ref(1)

    useProvideGridStore({
      scale,
      cellWidth,
      cellHeight,

      /**
       * GridItem uses this method to set it's BBox
       */
      setBBox (id: string, bbox: ItemBBox): void {
        itemBBoxes.value = {
          ...itemBBoxes.value,
          [id]: bbox
        }

        if (!inited) {
          inited = true
          nextTick(() => {
            centerStages()
          })
        }
      },

      itemFocus (): void {
        if (!panZoomInstance.value) { return }
        panZoomInstance.value?.pause()
        hidePaths.value = true
      },

      itemBlur (): void {
        if (!panZoomInstance.value) { return }
        panZoomInstance.value?.resume()
      },

      unregister (id: string): void {
        delete itemBBoxes.value[id]
        delete edgePositions.value[id]
      },

      setEdgePosition (
        edgeId: string,
        position: { x: number, y: number },
        accessSide: SIDE.LEFT | SIDE.RIGHT
      ): void {
        edgePositions.value = {
          ...edgePositions.value,
          [edgeId]: {
            accessSide,
            position: {
              x: position.x,
              y: position.y
            }
          }
        }
      }
    })

    const isMaxZoom = ref(false)
    const isMinZoom = ref(false)

    const emitTransform = (): void => {
      if (!panZoomInstance.value) { return }
      const transform = panZoomInstance.value.getTransform()
      scale.value = transform.scale
      emit('transform', transform)

      isMaxZoom.value = transform.scale === panZoomInstance.value.getMaxZoom()
      isMinZoom.value = transform.scale === panZoomInstance.value.getMinZoom()
    }

    const incZoom = (): void => {
      if (!panZoomInstance.value) { return }
      panZoomInstance.value.zoomTo(0, 0, 1.2)
    }

    const decZoom = (): void => {
      if (!panZoomInstance.value) { return }
      panZoomInstance.value.zoomTo(0, 0, 0.8)
    }

    watch(() => props.loading, (loading) => {
      if(loading) { return }
      nextTick(() => {
        panZoomInstance.value?.dispose?.()

        if (!gridContentEl.value) { return }

        panZoomInstance.value = panzoom(gridContentEl.value, {
          bounds: true,
          boundsPadding: 0.6,
          maxZoom: 2,
          minZoom: 0.4,
          initialZoom: 1,
          smoothScroll: false,
          zoomDoubleClickSpeed: 1 // disable double click zoom
        })

        emitTransform()

        panZoomInstance.value.on('panend', emitTransform)
        panZoomInstance.value.on('zoom', emitTransform)

        centerStages()
      })
    }, { immediate: true })

    onBeforeUnmount(() => {
      panZoomInstance.value?.off('panend', emitTransform)
      panZoomInstance.value?.off('zoom', emitTransform)
      panZoomInstance.value?.dispose?.()
    })

    const paths = ref<{ path: string, color: string }[]>([])

    const getPath = (edge: V2WorkflowEdgePayload, index: number): string => {
      if (!grid.value) { return '' }

      const stageOut = store.state.v2Workflow.editedWorkflow?.stages
        .find(s => edge.source_stage_id === s.id)

      const stageIn = store.state.v2Workflow.editedWorkflow?.stages
        .find(s => edge.target_stage_id === s.id)

      // for test stages, their edges connect to the next stage, but it's the
      // parent consensus stage that actually has placement on the board

      const parentStageIn = stageIn?.type === StageType.ConsensusTest
        ? store.state.v2Workflow.editedWorkflow?.stages.find(
          s => s.type === StageType.ConsensusEntrypoint && s.config.test_stage_id === stageIn?.id
        )
        : null

      const parentStageOut = stageOut?.type === StageType.ConsensusTest
        ? store.state.v2Workflow.editedWorkflow?.stages.find(
          s => s.type === StageType.ConsensusEntrypoint && s.config.test_stage_id === stageOut?.id
        )
        : null

      const inStagePos = itemBBoxes.value[parentStageIn?.id || edge.target_stage_id]
      const inEdge = edgePositions.value[`${edge.target_stage_id}_${edge.name}_in`]
      const outStagePos = itemBBoxes.value[parentStageOut?.id || edge.source_stage_id]
      const outEdge = edgePositions.value[`${edge.source_stage_id}_${edge.name}_out`]

      // Get in cell indexes
      const x1 = Math.round((inStagePos.x - box.value.minX + (inEdge?.position?.x || 0)) / 20)
      const y1 = Math.round((inStagePos.y - box.value.minY + (inEdge?.position?.y || 0)) / 20)
      grid.value.setDirectionalCondition(x1, y1, [inEdge?.accessSide])
      grid.value.setDirectionalCondition(x1, y1 - 1, [inEdge?.accessSide])
      grid.value.setDirectionalCondition(x1, y1 + 1, [inEdge?.accessSide])
      // Get out cell indexes
      const x2 = Math.round((outStagePos.x - box.value.minX + (outEdge?.position?.x || 0)) / 20)
      const y2 = Math.round((outStagePos.y - box.value.minY + (outEdge?.position?.y || 0)) / 20)
      grid.value.setDirectionalCondition(x2, y2, [outEdge?.accessSide])
      grid.value.setDirectionalCondition(x2, y2 - 1, [outEdge?.accessSide])
      grid.value.setDirectionalCondition(x2, y2 + 1, [outEdge?.accessSide])

      grid.value.cancelAllPaths()
      grid.value.findPath(
        x1,
        y1,
        x2,
        y2,
        (path: { x: number, y: number }[]) => {
          if (path) {
            paths.value[index].path = createRoundedPath(
              path.map(p => ({
                x: p.x * 20,
                y: p.y * 20 + 20
              } as Point<any>)),
              15 // radius
            )
          }
        }
      )
      grid.value.calculate()

      return ''
    }

    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)
    const calcPaths = (): void => {
      nextTick(() => {
        paths.value = props.edges.map((edge, index) => {
          let color = '#000'
          if (workflow.value) {
            const stage = workflow.value.stages.find(stage => stage.id === edge.source_stage_id)
            if (stage) {
              color = stageTheme[stage.type].edgeColorFocus
            }
          }

          return {
            path: getPath(edge, index),
            color
          }
        })

        hidePaths.value = false
      })
    }

    watch(() => grid.value, calcPaths)
    watch(() => props.edges, calcPaths, { immediate: true })

    const hoverOn = ref<null | number>(null)

    const onBgClick = (e: Event): void => {
      if (e.target === e.currentTarget) {
        emit('bg-click')
      }
    }

    return {
      hoverOn,
      hidePaths,
      box,
      matrix,
      paths,
      grid,
      getCellBBox,
      gridEl,
      gridContentEl,
      onBgClick,
      isMaxZoom,
      isMinZoom,
      incZoom,
      decZoom
    }
  }
})
</script>

<style lang="scss" scoped>
$canvasBaseSize: 6000px;

.grid {
  position: relative;
  overflow: visible;
  width: 100%;
  height: 100%;
  background-color: transparent;
  transform-origin: 0 0;

  z-index: var(--z-workflow-playground);
}

.grid__content {
  cursor: pointer;

  position: relative;
  display: block;
  width: $canvasBaseSize;
  height: $canvasBaseSize;
  background: transparent;
  background-image: radial-gradient(#caccce 1px, transparent 0);
  background-size: 20px 20px;
  background-position: 10px 10px;

  user-select: none;
}
</style>
