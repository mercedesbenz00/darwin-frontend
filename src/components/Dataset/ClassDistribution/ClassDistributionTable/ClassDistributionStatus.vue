<template>
  <div class="class-distribution-status">
    <component
      :is="iconTag"
      class="class-distribution-status__icon"
    />
    <label
      class="class-distribution-status__description"
      :class="`class-distribution-status__description--${status}`"
    >{{ statusDescription }}</label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DistributionStatus } from '@/components/Dataset/ClassDistribution/types'

import BalancedIcon from './assets/balanced.svg?inline'
import LowDataIcon from './assets/low-data.svg?inline'
import MediumLowDataIcon from './assets/medium-low-data.svg?inline'
import OverrepresentedIcon from './assets/overrepresented.svg?inline'
import UnderrepresentedIcon from './assets/underrepresented.svg?inline'
import VeryLowDataIcon from './assets/very-low-data.svg?inline'
import VeryOverrepresentedIcon from './assets/very-overrepresented.svg?inline'
import VeryUnderrepresentedIcon from './assets/very-underrepresented.svg?inline'

@Component({
  name: 'class-distribution-status',
  components: {
    BalancedIcon,
    LowDataIcon,
    MediumLowDataIcon,
    OverrepresentedIcon,
    UnderrepresentedIcon,
    VeryLowDataIcon,
    VeryOverrepresentedIcon,
    VeryUnderrepresentedIcon
  }
})
export default class ClassDistributionStatus extends Vue {
  @Prop({ required: true })
  status!: DistributionStatus

  readonly STATUS_DESCRIPTION_MESSAGES = {
    [DistributionStatus.VERY_OVERREPRESENTED]: 'Very Overrepresented',
    [DistributionStatus.OVERREPRESENTED]: 'Overrepresented',
    [DistributionStatus.BALANCED]: 'Balanced',
    [DistributionStatus.UNDERREPRESENTED]: 'Underrepresented',
    [DistributionStatus.VERY_UNDERREPRESENTED]: 'Very Underrepresented',

    [DistributionStatus.VERY_LOW_DATA]: 'Very Low Data',
    [DistributionStatus.LOW_DATA]: 'Low Data',
    [DistributionStatus.MEDIUM_LOW_DATA]: 'Medium Low Data'
  }

  get iconTag () { return `${this.status}-icon` }

  get statusDescription () { return this.STATUS_DESCRIPTION_MESSAGES[this.status] }
}
</script>

<style lang="scss" scoped>
.class-distribution-status {
  @include row;
  align-items: center;
}

.class-distribution-status__icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.class-distribution-status__description {
  @include typography(md, default, bold);

  &--very-overrepresented,
  &--very-underrepresented,
  &--very-low-data {
    color: $colorPink;
  }
  &--overrepresented,
  &--underrepresented,
  &--medium-low-data,
  &--low-data {
    color: #E0B312;
  }
  &--balanced { color: $colorFeatherLight; }
}
</style>
