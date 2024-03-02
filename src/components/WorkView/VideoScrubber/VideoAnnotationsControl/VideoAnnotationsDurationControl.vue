<template>
  <div class="video-annotations-duration-control">
    <duration-icon
      v-tooltip="{ content: 'Default annotation duration in frames' }"
      class="video-annotations-duration-control__icon"
    />
    <small-numeric-input
      v-model="_duration"
      v-input-auto-blur="true"
      class="video-annotations-duration-control__input"
      :min="1"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SmallNumericInput from '@/components/Common/SmallNumericInput.vue'
import { RootState } from '@/store/types'

import DurationIcon from './assets/duration.svg?inline'

@Component({
  name: 'video-annotations-duration-control',
  components: { DurationIcon, SmallNumericInput }
})
export default class VideoAnnotationsDurationControl extends Vue {
  @State((state: RootState) => state.workview.videoAnnotationDuration)
  videoAnnotationDuration!: number

  get _duration (): number {
    return this.videoAnnotationDuration
  }

  set _duration (val: number) {
    this.$store.commit('workview/SET_VIDEO_ANNOTATION_DURATION', val)
  }
}
</script>

<style lang="scss" scoped>
.video-annotations-duration-control {
  @include row--center;
  padding: 0 0 0 5px;
  background: $colorAliceShadow;
}

.video-annotations-duration-control__icon {
  width: 20px;
  margin-right: 5px;
}

.video-annotations-duration-control__input {
  width: 27px;
  height: 22px;
}
</style>
