<template>
  <div
    v-if="!isStopped"
    class="timer"
    :class="{'timer--paused': isPaused}"
    @click.stop.prevent="$emit('click')"
  >
    <div
      class="timer__content"
    >
      <clock-icon class="timer__content__icon" />
      <span
        class="timer__content__label"
        :time-in-seconds="timeInSeconds"
      >
        {{ minute }}
        <span class="timer__content__label__separator">:</span>
        {{ seconds }}
      </span>
    </div>
    <div class="timer__hover">
      <span
        class="timer__hover__label"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { formatDurationAsTimer } from '@/utils'

import { ClockIcon } from './assets/icons'

/**
 * Simple timer which shows time provided in seconds formatted as HH:MM.
 *
 * Renders different UI based on the status and current value of the timer.
 *
 * - if status is stopped, renders nothing
 * - if status is paused, renders timer in paused state
 * - if status is running, renders timer in active state
 *
 * It also has a different render state when paused, as well as a different render state on hover.
 */
@Component({ name: 'work-timer', components: { ClockIcon } })
export default class WorkTimer extends Vue {
  @Prop({ required: true, type: Number })
  timeInSeconds!: number

  @Prop({ required: true, type: String })
  status!: 'started' | 'paused' | 'stopped'

  hover: boolean = false

  get time (): string {
    return formatDurationAsTimer(this.timeInSeconds)
  }

  get minute (): string {
    return this.time.split(':')[0]
  }

  get seconds (): string {
    return this.time.split(':')[1]
  }

  get isPaused (): boolean {
    return this.status === 'paused'
  }

  get isStarted (): boolean {
    return this.status === 'started'
  }

  get isStopped (): boolean {
    return this.status === 'stopped'
  }
}
</script>

<style lang="scss" scoped>
$height: 36px;

.timer {
  position: relative;
  @include row--center;
  align-items: center;
  width: 80px;
  height: $height;

  &__content {
    @include row--center;
    align-items: center;

    &__icon {
      height: $height;

      circle,
      path {
        stroke: $colorInteractivePrimaryDefault;
      }
    }

    &__label {
      @include row--inline;
      align-items: center;
      @include typography(lg, inter, 500);
      height: $height;
      margin-left: 2px;
      line-height: $height;
      color: $colorInteractivePrimaryDefault;

      &__separator {
        margin: 0 2px;
      }
    }
  }

  &--paused {
    .timer__content,
    .timer__hover {
      &__icon {
        circle,
        path {
          stroke: $colorContentTertiary;
        }
      }
    }

    .timer__content {
      &__label {
        color: $colorContentTertiary;
      }
    }

    .timer__hover {
      &__label {
        color: $colorContentSecondary;
      }
    }
  }

  &__hover {
    position: absolute;
    display: none;
    @include fullsize;
    background-color: $colorOverlayHover;
    border-radius: 8px;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;

    &__label {
      @include typography(lg, inter, 500);
      height: $height;
      line-height: $height;
      color: $colorInteractivePrimaryDefault;
    }
  }

  &:hover {
    .timer__content {
      display: none;
    }

    .timer__hover {
      @include col--center;
    }
  }
}
</style>
