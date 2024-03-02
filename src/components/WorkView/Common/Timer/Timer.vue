<template>
  <div
    role="button"
    class="timer"
    :style="style"
    v-on="$listeners"
  >
    <svg
      class="timer__pie"
      :width="size + 2"
      :height="size + 2"
      :viewBox="`0 0 ${size + 2} ${size + 2}`"
    >
      <circle
        :r="size / 2"
        :cx="(size / 2) + 1"
        :cy="(size / 2) + 1"
        fill="rgba(255, 255, 255, 0.24)"
        stroke="currentColor"
        stroke-width="2"
      />
      <circle
        :r="size / 4"
        :cx="size - 2"
        :cy="(size / 2) + 1"
        fill="transparent"
        stroke="currentColor"
        stroke-width="7"
        :stroke-dasharray="`calc(1px * ${percentage} * 31.42 / 100) 31.42`"
        :stroke-dashoffset="`calc(1px * ${percentage} * 31.42 / 100) 31.42`"
        transform="rotate(-90) translate(-20)"
      />
    </svg>
    <x-icon
      v-if="showCancel"
      v-tooltip="tooltip"
      class="timer__cancel"
      :class="{ 'timer__cancel': !dark }"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { XIcon } from '@/assets/icons/V1'
import { useTimer } from '@/components/WorkView/Common/Timer/useTimer'

/**
 * Component used to render circle-based countdown timer in the workflow
 */
export default defineComponent({
  name: 'Timer',
  components: { XIcon },
  props: {
    /**
     * unix integer timestamp (in seconds), indicating when the timer should run out
     */
    completesAt: { type: Number, required: true },
    size: { default: 14, type: Number },
    dark: { type: Boolean, required: false, default: false },
    showCancel: { type: Boolean, required: false, default: true }
  },
  setup (props) {
    const { percentage, tooltip } = useTimer(props.completesAt)

    const style = computed((): Partial<{ [key in keyof CSSStyleDeclaration]: string }> => {
      return {
        height: `${props.size}px`,
        width: `${props.size}px`
      }
    })

    return {
      percentage,
      tooltip,
      style
    }
  }
})
</script>

<style lang="scss" scoped>
.timer {
  position: relative;
  @include row--center;
  align-items: center;
  justify-items: center;

  &__pie {
    z-index: 1;

    circle {
      transition: stroke-dasharray 1s linear;
    }
  }

  &__cancel {
    position: absolute;
    display: none;
    z-index: 2;

    &:active,
    &:focus {
      outline: none;
      border: none;
    }
  }

  &:hover {
    .timer {
      &__pie {
        visibility: hidden;
      }

      &__cancel {
        display: inline;

        path {
          stroke: $colorNeutralsWhite;
        }
      }
    }
  }
}
</style>
