<template>
  <v-popover
    popover-class="tooltip--feather tooltip--center-text annotator-rating__popover"
    trigger="hover"
    placement="right"
    offset="10"
    :boundaries-element="popoverBoundaryElement"
  >
    <slot :dataset-score="datasetScore" />

    <template slot="popover">
      <h2 class="annotator-rating__popover__title">
        Performance in this Dataset
      </h2>
      <template v-if="scoreInDataset">
        <div class="annotator-rating__popover__data">
          <div>Rating</div>
          <div class="annotator-rating__popover__data__score">
            {{ datasetScore }}
          </div>
        </div>
        <div class="annotator-rating__popover__data">
          <div>Merged instances</div>
          <div class="annotator-rating__popover__data__merges">
            {{ scoreInDataset.mergedInstances }}
          </div>
        </div>
        <div class="annotator-rating__popover__data">
          <div>Rejected instances</div>
          <div
            class="annotator-rating__popover__data__rejections"
          >
            {{ scoreInDataset.rejectedInstances }}
          </div>
        </div>
      </template>
      <h2 class="annotator-rating__popover__title">
        Team Performance
      </h2>
      <template v-if="scoreInTeam">
        <div class="annotator-rating__popover__data">
          <div>Rating</div>
          <div class="annotator-rating__popover__data__score">
            {{ teamScore }}
          </div>
        </div>
        <div class="annotator-rating__popover__data">
          <div>Merged instances</div>
          <div class="annotator-rating__popover__data__merges">
            {{ scoreInTeam.mergedInstances }}
          </div>
        </div>
        <div class="annotator-rating__popover__data">
          <div>Rejected instances</div>
          <div class="annotator-rating__popover__data__rejections">
            {{ scoreInTeam.rejectedInstances }}
          </div>
        </div>
      </template>
      <div v-else>
        Rating not available
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { StageActor } from '@/components/DatasetSettings/utils'
import { MembershipScore } from '@/store/types'

@Component({ name: 'annotator-score-popover' })
export default class AnnotatorScorePopover extends Vue {
  @Prop({ required: true })
  actor!: StageActor

  get scoreInDataset (): MembershipScore | null {
    return this.actor.scoreInDataset
  }

  get datasetScore (): string {
    const { scoreInDataset } = this
    if (!scoreInDataset || scoreInDataset.score === undefined) { return 'N/A' }
    if (scoreInDataset.score === null) { return 'NEW' }
    return `${scoreInDataset.score.toFixed(0)}%`
  }

  get scoreInTeam (): MembershipScore | null {
    return this.actor.scoreInTeam
  }

  get teamScore (): string {
    const { scoreInTeam } = this
    if (!scoreInTeam || scoreInTeam.score === undefined) { return 'N/A' }
    if (scoreInTeam.score === null) { return 'NEW' }
    return `${scoreInTeam.score.toFixed(0)}%`
  }

  get popoverBoundaryElement () {
    return document.body
  }
}
</script>

<style lang="scss" scoped>
.annotator-rating__popover__title {
  @include typography(xl, headers, bold);

  margin-bottom: 15px;

  &:not(:first-child) {
    margin-top: 15px;
  }
}

.annotator-rating__popover__data {
  @include typography(lg, default);
  @include row--distributed;
  margin-bottom: 3px;

  > * {
    padding: 5px;
  }

  &__score,
  &__merges,
  &__rejections {
    font-weight: bold;
  }

  &__score {
    background: $colorGrayMedium;
    border-radius: 3px;
    display: block;
  }

  &__merges {
    color: $colorPrimaryDark;
  }

  &__rejections {
    color: $colorPinkLite2;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.annotator-rating__popover {
  .tooltip-inner {
    padding: 25px;
    background: $colorSecondaryDark1;
    max-width: 350px;
  }
}
</style>
