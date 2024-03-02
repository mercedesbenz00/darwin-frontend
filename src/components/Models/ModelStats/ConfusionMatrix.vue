<template>
  <div>
    <div class="session_stats_header">
      <h1>Confusion Matrix</h1>
    </div>
    <div
      v-if="renderedMatrix"
      class="confusion-matrix-container"
    >
      <div
        class="confusion-matrix"
        :style="gridStyle"
      >
        <div
          v-for="(cell, index) in renderedMatrix"
          :key="index"
          class="confusion-matrix__cell"
          :style="cellStyle(cell, index)"
        >
          <span :style="textStyle(index)">{{ cell }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrainedModelPayload } from '@/store/types'

@Component({ name: 'confusion-matrix' })
export default class ConfusionMatrix extends Vue {
  @Prop({ default: null, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload | null

  /**
   * The dimension (in pixels) of each cell in the confusion matrix.
   */
  cellSize: number = 40

  /**
   * The dimension (in pixels) of the gap between cells in the confusion matrix.
   */
  gapSize: number = 7

  /**
   * Getter for the class names of the trained model.
   */
  get classes (): string[] | undefined {
    return this.trainedModel?.training_result?.classes
  }

  /**
   * Getter for the normalized confusion matrix.
   */
  get normalizedMatrix (): number[][] | undefined {
    return this.trainedModel?.training_result?.test_metrics?.norm
  }

  /**
   * Getter for the flattened confusion matrix.
   */
  get flattenedMatrix (): number[] | undefined {
    return this.normalizedMatrix?.flatMap(row => row.map(cell => (cell * 100)))
  }

  /**
   * The matrix to render originates from the flattened matrix,
   * with an additional left column and bottom row. These column and row
   * host the name of the classes for better visualization purposes.
   */
  get renderedMatrix (): string[] | undefined {
    const { classes, flattenedMatrix, numColumns } = this
    if (!classes || !flattenedMatrix) { return }

    const matrix: string[] = []
    for (let i = 0; i < flattenedMatrix.length; i++) {
      // Add the class name to the left column.
      if (i % numColumns === 0) {
        matrix.push(classes[i / numColumns])
      }
      matrix.push(flattenedMatrix[i].toFixed(1))
    }
    // Add the class name to the bottom row.
    for (const cls of ['', ...classes]) {
      matrix.push(cls)
    }

    return matrix
  }

  /**
   * Getter for the minimum value in the flattened matrix.
   */
  get minValue (): number | undefined {
    const { flattenedMatrix } = this
    return flattenedMatrix ? Math.min(...flattenedMatrix) : undefined
  }

  /**
   * Getter for the maximum value in the flattened matrix.
   */
  get maxValue (): number | undefined {
    const { flattenedMatrix } = this
    return flattenedMatrix ? Math.max(...flattenedMatrix) : undefined
  }

  /**
   * Getter for the number of columns in the confusion matrix.
   */
  get numColumns (): number {
    const { classes } = this
    return classes ? classes.length : 0
  }

  /**
   * Getter for the size (in pixels) of the grid.
   */
  get gridSize (): number {
    const { cellSize, gapSize, numColumns } = this
    return (numColumns + 3) * cellSize + numColumns * gapSize
  }

  /**
   * Getter for the style of the grid.
   */
  get gridStyle (): { [key: string]: string } {
    const { gapSize, gridSize, numColumns } = this
    return {
      gap: `${gapSize}px`,
      'grid-template-columns': `3fr repeat(${numColumns}, 1fr)`,
      height: `${gridSize}px`,
      width: `${gridSize}px`
    }
  }

  isLeftColumn (index: number): boolean {
    const { numColumns } = this
    return index % (numColumns + 1) === 0
  }

  isBottomRow (index: number): boolean {
    const { numColumns } = this
    return index >= (numColumns + 1) * (numColumns + 1) - numColumns
  }

  /**
   * Helper for the style of the cell text.
   */
  textStyle (index: number): { [key: string]: string } {
    const isBottomRow = this.isBottomRow(index)
    if (!isBottomRow) { return {} }

    const isLeftColumn = this.isLeftColumn(index)

    const { cellSize } = this
    const marginTop = isBottomRow ? cellSize : 0
    const marginLeft = isBottomRow ? -cellSize : 0

    const width = isLeftColumn ? cellSize * 3 : cellSize
    const height = isBottomRow ? cellSize * 3 : cellSize

    return {
      display: 'inline-block',
      height: `${width}px`,
      'margin-top': `${marginTop}px`,
      'margin-left': `${marginLeft}px`,
      overflow: 'hidden',
      transform: 'rotate(-90deg)',
      width: `${height}px`
    }
  }

  /**
   * Helper for the style of the cell.
   */
  cellStyle (value: string, index: number): { [key: string]: string } {
    const { cellSize, minValue, maxValue } = this

    const isLeftColumn = this.isLeftColumn(index)
    const isBottomRow = this.isBottomRow(index)

    const width = isLeftColumn ? cellSize * 3 : cellSize
    const height = isBottomRow ? cellSize * 3 : cellSize

    const parsedValue = parseFloat(value)
    if (value !== '' && isNaN(parsedValue)) {
      return {
        'background-color': '#F1F5F9',
        color: 'black',
        'font-size': '12px',
        'font-weight': 'regular',
        height: `${height}px`,
        'line-height': `${cellSize}px`,
        width: `${width}px`
      }
    }

    const opacity = (minValue === undefined || maxValue === undefined)
      ? 1.0
      : Math.max(0.2, (parseFloat(value) - minValue) / (maxValue - minValue))

    const color = opacity > 0.5 ? 'white' : 'black'

    return {
      'background-color': `rgba(114, 0, 204, ${opacity})`,
      color,
      'font-size': '12px',
      'font-weight': 'bold',
      height: `${height}px`,
      'line-height': `${cellSize}px`,
      width: `${width}px`
    }
  }
}
</script>

<style lang="scss" scoped>
.session_stats_header {
  @include row--distributed;
  padding: 10px;
  height: 60px;
}

.session_stats_header h1 {
  @include typography(xl-1, headlines, bold);
}

.confusion-matrix-container {
  background-color: $colorAliceLight;
  border-radius: 5px;
  box-shadow: inset 0px 2px 15px 0px rgba(145, 169, 192, 0.3);
  max-height: 500px;
  min-width: 300px;
  padding: 20px;
  overflow: scroll;
}

.confusion-matrix {
  display: grid;
  justify-items: center;
  align-items: center;
  padding: 0;
}

.confusion-matrix__cell {
  border-radius: 5px;
  text-align: center;
  vertical-align: middle;
}
</style>
