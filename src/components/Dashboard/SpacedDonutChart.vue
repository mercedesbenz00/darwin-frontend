<template>
  <div class="chart">
    <svg :viewBox="`${-blur} ${-blur} ${size + 2 * blur} ${size + 2 * blur}`">
      <filter
        id="chart-dropshadow"
        :x="-blur"
        :y="-blur"
        :height="size + 2 * blur"
        :width="size + 2 * blur"
      >
        <feOffset
          result="offOut"
          in="SourceGraphic"
          dx="0"
          dy="5"
        />
        <feGaussianBlur
          result="blurOut"
          in="offOut"
          stdDeviation="4"
        />
        <feBlend
          in="SourceGraphic"
          in2="blurOut"
          mode="normal"
        />
      </filter>
      <defs />
      <template v-if="chartData.length > 1">
        <path
          v-for="{ color, path } in chartData"
          :key="color"
          :fill="color"
          :stroke="color"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round"
          :d="path"
          filter="url(#chart-dropshadow)"
        />
      </template>
      <circle
        v-else-if="chartData.length === 1"
        :cx="cx"
        :cy="cy"
        :r="radius"
        fill="transparent"
        :stroke="chartData[0].color"
        :stroke-width="strokeWidth"
        filter="url(#chart-dropshadow)"
      />
    </svg>
    <div
      v-if="text"
      class="chart__description"
    >
      <div class="chart__description__text">
        {{ text }}
      </div>
      <div
        v-if="subtext"
        class="chart__description__subtext"
      >
        {{ subtext }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DonutChartDataItem } from './types'

const polarToCartesian =
  (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

type OutputDataItem = {
  value: number
  color: string
  path: string
  startAngle: number
  endAngle: number
}

@Component({ name: 'spaced-donut-chart' })
export default class SpacedDonutChart extends Vue {
  @Prop({ required: true, type: Array })
  data!: DonutChartDataItem[]

  @Prop({ required: false, type: String })
  text!: string

  @Prop({ required: false, type: String })
  subtext!: string

  initialAngleOffset: number = -90

  size: number = 300
  padding: number = 5
  thickness: number = 0
  strokeWidth: number = 8

  get blur () {
    return this.size * 0.1
  }

  get cx () {
    return this.size / 2
  }

  get cy () {
    return this.size / 2
  }

  get radius () {
    return this.size / 2 - this.thickness - (this.strokeWidth * 2)
  }

  get circumference () {
    return 2 * Math.PI * this.radius
  }

  get total () {
    if (!this.data) { return 0 }
    return this.data.reduce((prev, curr) => prev + curr.value, 0)
  }

  mapEntry (entry: DonutChartDataItem, runningOffset: number) {
    const { color, value } = entry

    const percentage = value / this.total

    const startAngle = runningOffset
    const endAngle = percentage * 360 + runningOffset

    const path = this.describeArc(startAngle + this.padding, endAngle - this.padding)

    return {
      value,
      color,
      path,
      startAngle,
      endAngle
    }
  }

  get chartData (): OutputDataItem[] {
    let runningOffset = 0
    const chartData: OutputDataItem[] = []

    this.data.forEach(inputItem => {
      const entry = this.mapEntry(inputItem, runningOffset)
      chartData.push(entry)
      runningOffset = entry.endAngle
    })
    return chartData.filter(d => (d.endAngle - d.startAngle) > 2 * this.padding)
  }

  describeArc (startAngle: number, endAngle: number) {
    const outerStart = polarToCartesian(this.cx, this.cy, this.radius, startAngle)
    const outerEnd = polarToCartesian(this.cx, this.cy, this.radius, endAngle)

    const innerRadius = this.radius - this.thickness

    const innerStart = polarToCartesian(this.cx, this.cy, innerRadius, startAngle)
    const innerEnd = polarToCartesian(this.cx, this.cy, innerRadius, endAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

    return [
      'M', outerEnd.x, outerEnd.y,
      'A', this.radius, this.radius, 0, largeArcFlag, 0, outerStart.x, outerStart.y,
      'M', outerStart.x, outerStart.y,
      'L', innerStart.x, innerStart.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerEnd.x, innerEnd.y,
      'L', outerEnd.x, outerEnd.y
    ].join(' ')
  }
}
</script>

<style lang="scss" scoped>
.chart {
  display: grid;

  // center items in grid both horizontally and vertically.
  align-items: center;
  justify-items: center;
}

.chart > * {
  // place all grid items into the same area
  // this overlays them on top of each other
  grid-area: 1 / 1 / 2 / 2;
}

.chart__description {
  @include col;
  align-items: center;
  justify-content: center;
}

.chart__description__text {
  @include typography(xl-1, default, bold)
}

.chart__description__subtext {
  @include typography(md, default, normal);
  color: $colorGrayLite;
}
</style>
