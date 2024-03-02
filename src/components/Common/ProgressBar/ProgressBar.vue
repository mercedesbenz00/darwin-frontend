<template>
  <div
    role="progressbar"
    class="progress-indicator"
    tabindex="1"
  >
    <span
      class="progress-indicator-value"
      :class="`progress-indicator-value--${variant}`"
      :style="style"
    />
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { ProgressBarProps, ProgressBarVariant } from '@/components/Common/ProgressBar/types'
import { valueValidator, variantValidator } from '@/components/Common/ProgressBar/validators'

type ProgressBarStyle = {
  backgroundColor?: string
  width: string
}

@Component({ name: 'progress-bar' })
export default class ProgressBar extends Vue {
  @Prop({ default: 0, type: Number, validator: valueValidator })
  value!: ProgressBarProps['value']

  @Prop({ type: String, default: ProgressBarVariant.ACTIVE, validator: variantValidator })
  variant!: ProgressBarVariant

  toWhole (num: number): number {
    return num * 100.0
  }

  get style (): ProgressBarStyle {
    const percentage = this.toWhole(this.value)
    if (percentage === 100.0) {
      return {
        backgroundColor: '#25A759',
        width: '100%'
      }
    }
    return {
      width: `${percentage}%`
    }
  }
}
</script>

<style lang='scss' scoped>
@mixin base($color) {
  transition: background-color 175ms ease, width 1s ease;

  display: block;
  height: 6px;
  border-radius: 16px;
  background-color: $color;
}

.progress-indicator {
  @include base($colorSurfaceRaise);

  position: relative;
  width: 100%;
  overflow: hidden;
}

.progress-indicator-value {
  @include base($colorSurfaceRaise);

  position: absolute;
  top: 0px;
  left: 0px;

  &--inactive {
    background-color: $colorContentDisabled;
  }

  &--active {
    background-color: $colorStatusInformative;
  }
}
</style>
