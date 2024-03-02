<template>
  <li
    ref="root"
    v-if="mainAnnotationTypeName !== 'string'"
    :id="`layer__${annotation.id}`"
    class="layerbar-item"
    :class="{
      'layerbar-item--active': annotation.isVisible,
      'layerbar-item--selected': annotation.isSelected,
      'layerbar-item--highlighted': annotation.isHighlighted
    }"
    @mouseenter.stop.prevent="highlightAnnotation"
    @mouseleave.stop.prevent="unHighlightAnnotation"
    @dblclick.stop.prevent="$emit('modify')"
  >
    <div class="layerbar-item__container">
      <div
        class="layerbar-item__content"
        role="button"
        @click.stop.prevent="selectAnnotation"
        @mousedown="$emit('mousedown')"
      >
        <type-icon
          class="layerbar-item__class-icon"
          :type="mainAnnotationTypeName"
          :color="annotationColor"
        />
        <div
          v-if="mainAnnotationTypeName === 'graph'"
          v-tooltip="{ content: annotationClassName }"
          class="layerbar-item__label"
        >
          {{ keyString }}
        </div>
        <div
          v-else
          v-tooltip="{ content: annotationClassName }"
          class="layerbar-item__label"
        >
          {{ annotationClassName }}
        </div>
        <div class="layerbar-item__slidable-container">
          <actor-item
            v-if="actor"
            :actor="actor"
          />
          <visibility-toggle
            :annotation="annotation"
            @dblclick.stop
          />
          <trash-button
            v-if="!readonly"
            @click="$emit('remove')"
          />
        </div>
        <confidence-score
          v-if="inferenceData"
          class="layerbar-item__confidence-score"
          :class-color="annotationColor"
          :inference-data="inferenceData"
          :name="annotationClassName"
        />
      </div>
      <div
        class="table-container"
        v-if="mainAnnotationTypeName === 'table'"
      >
        <table>
          <tr
            v-for="(row, rowIndex) of tableData"
            :key="rowIndex"
          >
            <td
              v-for="(cellData, colIndex) of row"
              :key="colIndex"
              :rowspan="cellData.rowSpan"
              :colspan="cellData.colSpan"
              :style="{'font-weight': cellData.isHeader ? 'bold' : 'normal'}"
            >
              {{ cellData.cellValue }}
            </td>
          </tr>
        </table>
      </div>
      <div
        v-else-if="mainAnnotationTypeName === 'graph'"
        class="value-row"
      >
        <key-value-arrow />
        <span class="value-string">{{ valueString }}</span>
      </div>
      <sub-annotations
        class="layerbar-item__sub-annotations"
        :annotation="annotation"
        :annotation-class="annotationClass"
        :readonly="readonly"
      />
    </div>
  </li>
</template>

<script lang="ts">
import { range } from 'lodash'
import { defineComponent, ref, computed, watch } from 'vue'

import { KeyValueArrow } from '@/assets/icons/V1'
import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'
import ConfidenceScore from '@/components/WorkView/ConfidenceScore/ConfidenceScore.vue'
import ActorItem from '@/components/WorkView/LayerBar/LayerBarItem/ActorItem.vue'
import SubAnnotations from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/V2/SubAnnotations.vue'
import TrashButton from '@/components/WorkView/LayerBar/LayerBarItem/TrashButton.vue'
import VisibilityToggle from '@/components/WorkView/LayerBar/LayerBarItem/VisibilityToggle.vue'
import { useStore } from '@/composables'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { InferenceMetadata } from '@/engineCommon/backend'
import { Editor } from '@/engineV2/editor'
import {
  GRAPH_ANNOTATION_TYPE,
  StringSource,
  STRING_ANNOTATION_TYPE
} from '@/engineV2/plugins/field/types'
import { Table, TABLE_ANNOTATION_TYPE } from '@/engineV2/plugins/table/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  AnnotationData,
  AnnotationTypePayload,
  GraphDataPayload,
  MembershipPayload
} from '@/store/types'
import { getInferenceData } from '@/utilsV2/getAnnotationInferenceData'

type TableRow = { rowSpan: number, colSpan: number, cellValue: string, isHeader: boolean }

const extractSourceTextsFromStringAnnotation = (
  annotation: StageAnnotation,
  annotations: StageAnnotation[],
  editor: Editor
): { text: string, ranges: number[] }[] => {
  const stringData: AnnotationData = editor.activeView.fileManager.isProcessedAsVideo
    ? editor.activeView.annotationManager.inferVideoAnnotationDataOnly(
      annotation.data,
      STRING_ANNOTATION_TYPE
    )
    : annotation.data

  if (!('string' in stringData)) { return [] }

  const { string } = stringData
  if (!string) { return [] }

  const { sources } = string
  const data = []
  for (const source of sources) {
    const annotation = annotations.find(a => a.id === source.id)
    if (!annotation) { continue }

    const annotationData: AnnotationData = editor.activeView.fileManager.isProcessedAsVideo
      ? editor.activeView.annotationManager.inferVideoSubAnnotationDataOnly(annotation.data)
      : annotation.data

    if (!('text' in annotationData)) { continue }

    const text = annotationData.text.text
    const ranges: number[] = []
    if (source.ranges === null) {
      for (const i of range(text.length)) {
        ranges.push(i)
      }
    } else {
      for (const [start, end] of source.ranges) {
        for (const i of range(start, end)) {
          ranges.push(i)
        }
      }
    }

    data.push({ text, ranges })
  }
  return data
}

export default defineComponent({
  name: 'LayerBarItem',
  components: {
    ActorItem,
    ConfidenceScore,
    KeyValueArrow,
    SubAnnotations,
    TrashButton,
    TypeIcon,
    VisibilityToggle
  },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const activeView = useActiveView()

    const { state, getters } = useStore()

    const stageAnnotations = computed(() => state.workview.stageAnnotations)

    const findMembershipInRelevantTeamsByUserId = computed(
      (): (id: number) => MembershipPayload | null =>
        getters['team/findMembershipInRelevantTeamsByUserId']
    )
    const getMainAnnotationType = computed(
      (): (val: AnnotationClassPayload) => AnnotationTypePayload =>
        getters['aclass/mainAnnotationTypeForClass']
    )

    const actor = computed((): MembershipPayload | null => {
      const firstActor = props.annotation.actors[0]
      if (!firstActor) { return null }
      return findMembershipInRelevantTeamsByUserId.value(firstActor.user_id)
    })

    const classesById = computed(() => state.aclass.classesById)

    const annotationClass = ref<AnnotationClassPayload>()

    const mainAnnotationTypeName = computed((): string | null => {
      if (!annotationClass.value) { return null }
      const mainAnnotationType = getMainAnnotationType.value(annotationClass.value)
      return mainAnnotationType.name
    })

    const annotationColor = computed((): string => {
      return annotationClass.value ? annotationClass.value.metadata._color : '#000000'
    })

    const annotationClassName = computed((): string => {
      return annotationClass.value
        ? annotationClass.value.name
        : 'Unknown class'
    })

    const inferenceData = computed((): InferenceMetadata | void => {
      const data = getInferenceData(props.annotation.data, editor.value)
      if (!data) { return }
      return data.inference
    })

    const root = ref()

    watch(() => props.annotation.annotation_class_id, (classId: number) => {
      annotationClass.value = classesById.value[classId]
    }, { immediate: true })

    watch(() => props.annotation.isSelected, (isSelected: boolean) => {
      if (!isSelected) { return }
      // If the selection is overlapped with the header or the bottom, it needs to scroll.
      // If whole body of selection is visible, no need to scroll.
      const { top: curTop, bottom: curBottom } = root.value.getBoundingClientRect()
      const headerElement = document.querySelector('.layerbar__header') as HTMLDivElement
      const footerElement = document.querySelector('.workview__center__layerbar') as HTMLDivElement
      if (headerElement && footerElement) {
        const headerBottom = headerElement.getBoundingClientRect().bottom
        const footerBottom = footerElement.getBoundingClientRect().bottom
        if (curTop < headerBottom) {
          root.value.scrollIntoView(true)
        } else if (curBottom > footerBottom) {
          root.value.scrollIntoView(false)
        }
      }
    })

    const highlightAnnotation = (): void => {
      activeView.value.annotationManager.highlightAnnotation(props.annotation.id)
    }

    const unHighlightAnnotation = (): void => {
      activeView.value.annotationManager.unhighlightAnnotation(props.annotation.id)
    }

    const selectAnnotation = (): void => {
      activeView.value.annotationManager.toggleSelectAnnotation(props.annotation.id)
    }

    const graphData = computed((): GraphDataPayload | undefined => {
      const data: AnnotationData = activeView.value.fileManager.isProcessedAsVideo
        ? activeView.value.annotationManager.inferVideoAnnotationDataOnly(
          props.annotation.data,
          GRAPH_ANNOTATION_TYPE
        )
        : props.annotation.data

      return data.graph
    })

    const keyString = computed((): string => {
      if (annotationClassName.value !== 'keyvalue') {
        return annotationClassName.value
      }

      if (!graphData.value) { return '' }

      const startNode = graphData.value.nodes.find(n => n.name === 'key')
      if (!startNode) { return '' }

      const startAnnotation = stageAnnotations.value.find(a => a.id === startNode.id)
      if (!startAnnotation) { return '' }

      const startStringData = extractSourceTextsFromStringAnnotation(
        startAnnotation,
        stageAnnotations.value,
        editor.value
      )
      return startStringData.map(d => d.text).join(' ')
    })

    const valueString = computed((): string => {
      if (!graphData.value) { return '' }

      const endNode = graphData.value.nodes.find(n => n.name === 'value')
      if (!endNode) { return '' }

      const endAnnotation = stageAnnotations.value.find(a => a.id === endNode.id)
      if (!endAnnotation) { return '' }

      const endStringData = extractSourceTextsFromStringAnnotation(
        endAnnotation,
        stageAnnotations.value,
        editor.value
      )

      return endStringData.map(d => d.text).join(' ')
    })

    const tableData = computed((): TableRow[][] => {
      const data: AnnotationData = activeView.value.fileManager.isProcessedAsVideo
        ? activeView.value.annotationManager.inferVideoAnnotationDataOnly(
          props.annotation.data,
          TABLE_ANNOTATION_TYPE
        )
        : props.annotation.data

      const table: Table = data.table
      if (!table) { return [] }

      const sortedCells = [...table.cells]
        .sort((a, b) => a.col - b.col)
        .sort((a, b) => a.row - b.row)

      const tableData: TableRow[][] = []

      // Table cell can span for multiple rows and columns.
      // For each cell, we need to find the row and column that the cell starts at,
      // and determine homany rows and columns the cell spans.
      // The span may depend on the next cell's row and column, so we need to iterate over
      // all cells to find the span.
      // Finally, when the current row number is greater than the previous row number,
      // we need to add a new row to the tableData.
      let currentRow = -1
      let currentCol = 1
      for (const cell of sortedCells) {
        if (cell.row > currentRow + 1) {
          tableData.push([])
          currentRow += 1
          currentCol = 1
        }

        let colSpan = 0
        while (cell.col > currentCol) {
          currentCol++
          colSpan++
        }
        if (colSpan > 0) {
          tableData[currentRow].push({ cellValue: '', rowSpan: 1, colSpan, isHeader: false })
        }

        const annotation = stageAnnotations.value.find(a => a.id === cell.id)
        if (!annotation) { continue }

        const stringData: AnnotationData = activeView.value.fileManager.isProcessedAsVideo
          ? activeView.value.annotationManager.inferVideoAnnotationDataOnly(
            annotation.data,
            STRING_ANNOTATION_TYPE
          )
          : annotation.data

        if (!('string' in stringData)) {
          continue
        }

        const cellValue = stringData.string.sources
          .map((s: StringSource) => {
            const sourceAnnotation = stageAnnotations.value.find(a => a.id === s.id)
            if (!sourceAnnotation) { return '' }

            const sourceData: AnnotationData = activeView.value.fileManager.isProcessedAsVideo
              ? activeView.value.annotationManager.inferVideoSubAnnotationDataOnly(
                sourceAnnotation.data
              )
              : sourceAnnotation.data

            if (!('text' in sourceData)) { return '' }
            return sourceAnnotation ? sourceData.text.text : ''
          })
          .filter((s: string) => s !== '')
          .join(' ')

        tableData[currentRow].push({
          cellValue,
          rowSpan: 1,
          colSpan: cell.col_span,
          isHeader: cell.is_header
        })
        currentCol += cell.col_span
      }
      return tableData
    })

    return {
      root,
      actor,
      annotationClass,
      mainAnnotationTypeName,
      annotationColor,
      annotationClassName,
      inferenceData,
      highlightAnnotation,
      unHighlightAnnotation,
      selectAnnotation,
      keyString,
      valueString,
      tableData
    }
  }
})
</script>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.layerbar-item {
  @include col;
  list-style: none;
  overflow: hidden;
  padding: 1px 0;

  background: $colorSurfaceDefault;
  cursor: pointer;
}

.layerbar-item__container {
  border-radius: 8px;
  margin: 1px 0;
  padding: 0 4px;
}

.layerbar-item:not(.layerbar-item--active) {
  opacity: .5;
  color: $colorAliceNight;
}

.layerbar-item.layerbar-item--active {
  .layerbar-item__slidable-container > * {
    color: $color90Black;
  }
}

.layerbar-item.layerbar-item--selected .layerbar-item__container {
  background: $colorOverlayInteractive;
}

.layerbar-item.layerbar-item--highlighted:not(.layerbar-item--selected) .layerbar-item__container {
  background: $colorOverlayHover;
}

.layerbar-item.sortable-ghost {
  width: 75%;
}

.layerbar-item__class-icon {
  display: inline-block;
  width: 23px;
  height: 23px;
  text-align: center;
  margin: 0 4px 0 0;
}

.layerbar-item__label {
  @include ellipsis(1);
  @include fontRegularBody200;
  flex: 1;
  vertical-align: top;
  padding: 6px 0 4px 0;
}

.layerbar-item__content {
  width: 100%;
  @include row;
  align-items: center;
  position: relative;
  font-size: 0;
  white-space: nowrap;
  overflow: hidden;
}

.sortable-ghost.layerbar-item .layerbar-item__content {
  height: 3px;
  z-index: 1;
  content: '';
  background: black;
  position: relative;
}

.layerbar-item__slidable-container {
  @include row;
  align-items: center;
  height: 100%;
  display: none;
  padding: 0;
  text-align: right;
}

.layerbar-item__confidence-score {
  @include typographyRegularBody50;
  margin: auto;
  width: 33px;
  height: 18px;
}

$icon-button-width: 20px;
$icon-button-padding: 2px;
$icon-button-size: $icon-button-width + $icon-button-padding * 2;

.layerbar-item {
  &:not(.layerbar-item--active),
  &:hover {
    .layerbar-item__slidable-container {
      display: flex;
    }
  }
}

.layerbar-item__slidable-container > * {
  @include square($icon-button-width);
  margin: 0 $icon-button-padding;
  color: $colorAliceNight;
}

.layerbar-item__sub-annotations {
  @include fontRegularBody200;
  padding: 2px 10px 2px 12px;
}

table, tr, td {
  font-size: 8px;
  border: 1px solid black;
}

table {
  border-collapse: collapse;
  border-radius: 5px;
  width: 100%;
}

td {
  padding: 4px;
}

tr:nth-child(odd) {
  background-color: $colorAliceShade;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.value-row svg {
  min-width: 20px;
  width: 20px;
}

.value-string {
  @include fontRegularBody100;
}

.table-container {
  overflow: scroll;

  @include hidden-scrollbar;
}
</style>
