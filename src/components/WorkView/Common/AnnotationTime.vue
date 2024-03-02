<template>
  <div
    v-tooltip="'Total time the annotator has spent on this image'"
    class="annotation-time"
  >
    <img
      class="annotation-time__icon"
      src="/static/imgs/clock.svg"
    >
    <div class="annotation-time__clock">
      {{ time }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { formatDurationAsTimer } from '@/utils'

/**
 * Shows total annotation time on a task, as a HH:MM:SS time display with an icon in front
 */
@Component({ name: 'annotation-time' })
export default class AnnotationTime extends Vue {
  @Prop({ required: false, default: null, type: Number })
  timeInSeconds!: number | null

  get time (): string {
    const { timeInSeconds } = this
    return formatDurationAsTimer(timeInSeconds || 0)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.annotation-time {
  @include row--center;

}

.annotation-time__icon {
  margin-right: 5px;
  padding-bottom: 3px;
}

.annotation-time__clock {
  @include typography(md-1, default, 500);
}
</style>
