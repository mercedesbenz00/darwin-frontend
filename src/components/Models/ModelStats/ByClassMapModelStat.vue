<template>
  <div v-if="values.length > 0">
    <div class="by-class-map__title">
      <h1>Precision/Recall Breakdown</h1>
    </div>
    <div class="by-class-map">
      <div>
        &nbsp;
      </div>
      <div class="by-class-map__precision-title">
        Precision
      </div>
      <div class="by-class-map__recall-title">
        Recall
      </div>
      <template v-for="klass in values">
        <div
          class="by-class-map__class"
          :key="`class-${klass.index}`"
        >
          <span>{{ klass.name }}</span>
          <span>{{ klass.count }}</span>
        </div>

        <div
          class="by-class-map__precision"
          :style="valueStyle(klass.map)"
          :key="`precision-${klass.index}`"
        >
          {{ klass.map }}
        </div>

        <div
          class="by-class-map__recall"
          :style="valueStyle(klass.mar)"
          :key="`recall-${klass.index}`"
        >
          {{ klass.mar }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { groupBy } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import {
  DatasetReportClassDistributionPayload,
  TrainedModelPayload
} from '@/store/types'

@Component({
  name: 'by-class-map-model-stat'
})
export default class ByClassMapModelStat extends Vue {
  @Prop({ required: true })
  trainedModel!: TrainedModelPayload

  @Prop({ required: true })
  datasetDistributions!: DatasetReportClassDistributionPayload[]

  get mapValues () {
    return this.trainedModel.training_result['test/map_per_class']
  }

  get marValues () {
    return this.trainedModel.training_result['test/mar_100_per_class']
  }

  get distributionsByName () {
    return groupBy(this.datasetDistributions, (item) => item.name)
  }

  get classNames () {
    if (this.trainedModel.training_result?.classes) {
      return this.trainedModel.training_result.classes.slice(1)
    }

    return []
  }

  get values () {
    return this.classNames.map((name: string, index: number) => {
      const distribution = this.distributionsByName[name]

      return {
        name,
        index,
        map: Math.round(this.mapValues[index] * 1000) / 1000,
        mar: Math.round(this.marValues[index] * 1000) / 1000,
        count: distribution ? distribution[0].count : null
      }
    })
  }

  valueStyle (value: number): { [key: string]: string } {
    const opacity = Math.max(0.2, value)

    return {
      'background-color': `rgba(98, 28, 210, ${opacity})`
    }
  }
}
</script>

<style lang="scss" scoped>
$gap: 4px;
$valueColumnWidth: 70px;
$mapMaxWidth: 400px;
$mapPrecisionTitleFontSize: 0.85rem;
$mapClassFontSize: 0.8rem;
$mapValueFontSize: 0.75rem;

.by-class-map {
  @include typography(md, Mulish);

  display: grid;
  grid-template-columns: auto $valueColumnWidth $valueColumnWidth;
  gap: $gap;
  max-width: $mapMaxWidth;

  font-style: normal;
  line-height: 1.125rem;
  font-weight: bold;

  &__title {
    @include row--distributed;
    height: 50px;

    h1 {
      @include typography(xl, default, bold);
    }
  }

  &__precision-title, &__recall-title {
    font-size: $mapPrecisionTitleFontSize;
    text-align: center;
  }

  &__class {
    display: grid;
    grid-template-columns: auto 40px;
    background-color: $colorNeutralsLightWhite;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: $mapClassFontSize;

    span:last-child {
      text-align: right;
      color: $colorAliceNight;
    }
  }

  &__precision, &__recall {
    padding: 0.5rem;
    background-color: $colorModelPurple;
    color: $colorWhite;
    border-radius: 0.25rem;
    text-align: center;
    font-size: $mapValueFontSize;
  }
}
</style>
