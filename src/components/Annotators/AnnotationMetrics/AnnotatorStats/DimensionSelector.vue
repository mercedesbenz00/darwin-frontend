<template>
  <div
    class="selector"
    @click="$emit($event.shiftKey ? 'toggle-except' : 'toggle')"
  >
    <div class="selector__info">
      <slot />
    </div>
    <div class="selector__options">
      <button
        v-for="option in options"
        :key="option.dimension"
        v-tooltip="labels[option.dimension]"
        class="selector__options__option"
        :class="{'selector__options__option--active': option.active}"
        @click.stop="$emit('select', option.dimension)"
      >
        <img :src="option.icon">
        <span>{{ option.value }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { dimensionLabels } from '@/components/Annotators/AnnotationMetrics/data'
import {
  AnnotationChartData,
  ChartDimension
} from '@/components/Annotators/AnnotationMetrics/types'
import TeamMemberAvatar from '@/components/Common/Avatar/V1/TeamMemberAvatar.vue'
import { formatDurationAsSpan, formatNumericValue } from '@/utils'

@Component({ name: 'dimension-selector', components: { TeamMemberAvatar } })
export default class DimensionSelector extends Vue {
  @Prop({ required: true, type: Object })
  chartData!: AnnotationChartData

  @Prop({ required: true, type: String })
  dimension!: ChartDimension

  labels = dimensionLabels

  // time
  get formattedTime (): string {
    return formatDurationAsSpan(this.chartData.dimensions.annotationTime)
  }

  // annotations
  get formattedAnnotations (): string {
    return formatNumericValue(this.chartData.dimensions.annotationsCreated)
  }

  // average
  get formattedAverage (): string {
    return this.chartData.dimensions.avgTimePerAnnotation === null
      ? 'N/A'
      : this.chartData.dimensions.avgTimePerAnnotation.toFixed(1)
  }

  // annotated images
  get formattedImages (): string {
    return formatNumericValue(this.chartData.dimensions.imagesAnnotated)
  }

  // review pass rate

  get reviewPassRate (): string {
    if (this.chartData.dimensions.reviewPassRate === null) { return 'N/A' }
    return `${this.chartData.dimensions.reviewPassRate.toFixed(1)}%`
  }

  get options () {
    const visible = this.chartData.visible
    return [
      {
        dimension: 'annotationTime',
        icon: '/static/imgs/clock.svg',
        value: this.formattedTime,
        active: visible && this.dimension === 'annotationTime'
      },
      {
        dimension: 'annotationsCreated',
        icon: '/static/imgs/annotation.svg',
        value: this.formattedAnnotations,
        active: visible && this.dimension === 'annotationsCreated'
      },
      {
        dimension: 'avgTimePerAnnotation',
        icon: '/static/imgs/gauge.svg',
        value: this.formattedAverage,
        active: visible && this.dimension === 'avgTimePerAnnotation'
      },
      {
        dimension: 'imagesAnnotated',
        icon: '/static/imgs/image.svg',
        value: this.formattedImages,
        active: visible && this.dimension === 'imagesAnnotated'
      },
      {
        dimension: 'reviewPassRate',
        icon: '/static/imgs/check_circle.svg',
        value: this.reviewPassRate,
        active: visible && this.dimension === 'reviewPassRate'
      }
    ]
  }
}
</script>

<style lang="scss" scoped>
.selector {
  @include row--distributed;
  align-items: center;

  background: $colorWhite;
  padding: 15px;
}

.selector__info {
  @include row;
  align-items: center;
  width: 25%;
}

.selector__options {
  @include row;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  width: 75%;
}

.selector__options__option {
  @include row;
  align-items: center;
  justify-content: center;

  padding: 10px;
  margin-right: 10px;
  width: 15%;

  @include respondTo(xxl) {
    width: 18%;
  }

  @include respondTo(lg) {
    width: calc(20% - 10px)
  }

  @include respondTo(lg) {
    width: calc(33% - 10px)
  }

  transition: background-color .2s ease;
  transition: box-shadow .2s ease;

  background: $colorWhite;
  border-radius: 3px;
}

.selector__options__option:hover {
  background: $colorLineGrey;
  box-shadow: 0px 0px 2px $colorLineGrey, 0px 3px 3px rgba(145, 169, 192, 0.3);
}

.selector__options__option--active {
  background: $colorPrimaryLight2;
  box-shadow: 0px 0px 4px $colorPrimaryLight2, 0px 4px 4px rgba(145, 169, 192, 0.3);
}

.selector__options__option img {
  margin-right: 10px;
}

// clock has a small notch on top, which makes it appear not centered, even though it is
.selector__options__option img[src="/static/imgs/clock.svg"] {
  padding-bottom: 2px;
}
</style>
