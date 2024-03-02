<template>
  <div class="threshold-slider">
    <Slider
      class="slider"
      :min="0"
      :max="100"
      :value="percentageValue"
      :step="1"
      @input="onSliderChange"
    />
    <InputFieldV2
      class="number-input"
      type="number"
      :min="0"
      :max="100"
      :value="valueAsString"
      @input="onInputChange"
      @enter="loseFocus"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import InputFieldV2 from '@/components/Common/InputField/V2/InputField.vue'
import Slider from '@/components/Common/Slider/V2/Slider.vue'
import { clamp } from '@/utils/number'

/**
 * @Component General threshold'
 */
export default defineComponent({
  name: 'ThresholdSlider',
  props: {
    value: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  components: { Slider, InputFieldV2 },
  setup (props, context) {
    const percentageValue = computed(() => props.value * 100)
    const valueAsString = computed(
      () => `${Math.floor(percentageValue.value)}`
    )

    const onInputChange = (valueAsString: string): void => {
      const value = parseInt(valueAsString || '0') / 100
      return context.emit('change', clamp(value, 0, 1))
    }
    const onSliderChange = (value: number): void => {
      return context.emit('change', value / 100)
    }

    const loseFocus = ({ input }: { input: HTMLInputElement }): void => {
      input.blur()
    }

    return {
      percentageValue,
      valueAsString,
      onInputChange,
      onSliderChange,
      loseFocus
    }
  },
})
</script>

<style lang="scss" scoped>
.threshold-slider {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;

  .slider {
    width: calc(100% - 52px);

    &:deep(input) {
      width: 100%;
    }
  }

  &:deep(.inputfield__container) {
    padding: 3px;
    height: 20px;
    border-radius: 4px;
    position: relative;
    border: transparent;

    &.focused,
    &:hover {
      background: $colorSurfaceElevate;
    }

    &::after {
      display: inline-block;
      content: "%";
      position: absolute;
      right: 0;
      margin-right: 5px;
    }

    .inputfield {
      -moz-appearance:textfield;

      padding-right: 18px;
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        appearance: none;
        margin: 0;
      }

      &::-moz-outer-spin-button,
      &::-moz-inner-spin-button {
        margin: 0;
      }
    }
  }

  .number-input {
    width: 52px;
  }
}
</style>
