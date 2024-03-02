<template>
  <div class="tier-selection">
    <h3 class="tier-selection__header">
      Tier
    </h3>
    <div class="tier-selection__content">
      <div class="tier-selection__content__left">
        <double-slider
          :value="tier"
          :options="sliderOptions"
          @change="$emit('select', $event)"
        />
      </div>
      <div
        v-if="tierData"
        class="tier-selection__content__right tier-selection__description"
      >
        <h4 class="tier-selection__description__title">
          {{ tierData.name }}
        </h4>
        <p class="tier-selection__description__content">
          {{ tierData.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ModelTier, TierData } from '@/store/modules/neuralModel/types'

import DoubleSlider from './DoubleSlider.vue'

/**
 * Renders model tier selection UI as a slider on the left side and selection details on the right
 *
 * Slider has a top and bottom set of labels. To render both and keep them in sync, a trick with the
 * <slider> component is used.
 *
 * Two slider components are rendered, but the one in charge of the top labels has it's styles
 * overriden so only the labels are shown, rather than the entire UI.
 *
 * To keep the two in sync, they bind to the same value.
 */
@Component({ name: 'tier-selection', components: { DoubleSlider } })
export default class TierSelection extends Vue {
  @Prop({ required: true, type: String })
  tier!: ModelTier

  @State(state => state.neuralModel.tiers)
  tiers!: TierData[]

  get tierIds () {
    return this.tiers.map(t => t.id)
  }

  get tierData () {
    return this.tiers.find(t => t.id === this.tier)
  }

  get sliderOptions () {
    return {
      data: this.tierIds,
      bottomMarks: {
        evaluation: { label: 'free' },
        standard: { label: 'stable' },
        production: { label: '+support' }
      },
      topMarks: {
        evaluation: { label: 'evaluation' },
        standard: { label: 'standard' },
        production: { label: 'production' }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.tier-selection {
  @include col;
  width: 100%;
}

.tier-selection__header {
  @include typography(lg-1, headlines, bold);
  margin-bottom: 25px;
}

.tier-selection__content {
  @include row--distributed;
}

.tier-selection__content__left {
  padding: 25px;
  padding-top: 0;
  width: 45%;
  margin-left: 15px;
}

.tier-selection__content__right {
  width: 55%;
  height: 100%;
  margin-left: 35px;
}

.tier-selection__description {
  background: $colorSecondaryLight3;
  @include col;
  padding: 20px 15px;
  align-content: stretch;
}

.tier-selection__description__title {
  @include typography(lg, headlines, bold);
  margin-bottom: 15px;
}

.tier-selection__description__content {
  @include typography(md-1, default, 400);
  line-height: 26px;
}
</style>
