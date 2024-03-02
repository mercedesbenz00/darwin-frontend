<template>
  <div class="auto-annotate-slider">
    <slider
      v-model="threshold"
      :options="options"
      @change="onThreshold"
    />
    <span class="percentage">
      <input
        class="percentage-input"
        v-model="_percentage"
        @keydown.stop
        @keyup.stop
      >
      %
    </span>
    <tooltip-info
      class="info"
      :content="tooltip"
      placement="bottom"
    />
  </div>
</template>

<script lang="ts">
import { toNumber } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import Slider from '@/components/Common/Slider/V1/Slider.vue'
import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import { Editor } from '@/engine/editor'

@Component({ name: 'auto-annotate-slider', components: { Slider, TooltipInfo } })
export default class AutoAnnotateSlider extends Vue {
  @Prop({ required: true })
  editor!: Editor

  threshold: number = 0.5

  get options () {
    return {
      width: 72,
      height: 6,
      margin: 'auto',
      padding: 0,
      dotSize: 12,
      min: 0.0,
      max: 1.0,
      speed: 1,
      interval: 0.01,
      tooltip: 'none',
      dotStyle: {
        background: this.$theme.getColor('colorWhite'),
        borderColor: this.$theme.getColor('colorWhite'),
        boxShadow: this.$theme.getShadow('shadowSM')
      },
      processStyle: {
        backgroundColor: this.$theme.getColor('colorContentTertiary'),
        borderRadius: 4
      },
      railStyle: {
        backgroundColor: this.$theme.getColor('colorGray20'),
        backgroundPosition: 'center',
        borderRadius: 4
      }
    }
  }

  get percentage (): number {
    const { threshold } = this
    return Math.trunc(threshold * 100)
  }

  get _percentage (): string { return `${this.percentage}` }
  set _percentage (value: string) {
    const size = toNumber(value)
    if (size < 0 || size > 100 || isNaN(size)) {
      this.$store.dispatch('toast/notify', {
        content: 'Threshold should be a value between 0 and 100'
      })
    }
    if (isNaN(size) || size < 0) {
      // hack: I want `this.percentage` to be recomputed, but if `this.threshold`
      // heppens to be equal to 0 already, `this.percentage` will not be recomputed!
      // so, I set it to another value first, only to reset it to 0
      this.threshold = 0.5
      this.threshold = 0
    } else if (size > 100) {
      // hack: same as in the previous if branch
      this.threshold = 0.5
      this.threshold = 1
    } else {
      this.threshold = size / 100
    }
  }

  get tooltip (): string {
    const { percentage } = this
    return (
      `Auto-Annotate will only generate annotations with confidence greater than ${percentage}%`
    )
  }

  onThreshold (threshold: number): void {
    this.editor.callCommand('clicker_tool.set_threshold', threshold)
  }
}
</script>

<style lang="scss" scoped>
.auto-annotate-slider {
  @include row--distributed;
  width: 141px;
  height: 32px;
  padding: 8px;
  border: 1px solid $colorInteractiveSecondaryHover;
  box-sizing: border-box;
  border-radius: 8px;
}

.auto-annotate-slider:hover {
  background-color: $colorOverlayHover;
}

.percentage {
  @include row--center;
  padding: 1px 2px;
  border-radius: 4px;
  @include typography(sm, defult, 500);
  color: $colorNeutrals600;
  font-family: $fontFamilyInter;
}

.percentage:hover {
  background-color: $colorWhite;
}

.percentage:hover .percentage-input {
  color: $colorBlack;
}

.percentage:focus-within {
  background-color: $colorWhite;
}

.percentage .percentage-input.focus-visible {
  color: $colorBlack;
  caret-color: $colorInteractivePrimaryDefault;
}

.percentage-input {
  background-color: transparent;
  width: 20px;
  padding: 0 2px;
  @include typography(sm, defult, 500);
  caret-color: $colorInteractivePrimaryDefault;
  color: $colorNeutrals600;
  font-family: $fontFamilyInter;
  text-align: right;
}

.info {
  width: 12px;
  height: 12px;
  align-self: flex-end;
  border: 1.5px solid $colorContentTertiary;
}

.info--active {
  background-color: rgba(0, 0, 0, 0.16);
  border: 1.5px solid $colorContentTertiary;
}

:deep(.info) svg {
  color: $colorContentTertiary !important;
  height: 75% !important;
}

:deep(.info--active) svg {
  color: $colorNeutrals600 !important;
}

:deep(.tooltip) {
  @include typography(md, default, 500);
  font-family: $fontFamilyInter;
  width: 200px;
  max-width: 200px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 3px 4px;
  background-color: $colorSurfaceInverted;
  border-radius: 4px;
}

:deep(.vue-slider) {
  margin: auto 0;
  padding: 0 !important;
}
</style>
