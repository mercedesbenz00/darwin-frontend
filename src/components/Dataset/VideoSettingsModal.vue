<template>
  <modal
    name="video-modal"
    transition="pop-out"
    width="35%"
    :classes="['video-modal']"
    :min-width="350 * $theme.getCurrentScale()"
    :max-width="600 * $theme.getCurrentScale()"
    :height="550 * $theme.getCurrentScale()"
    :click-to-close="false"
  >
    <div class="modal-header">
      <p class="video-modal__title">
        Settings for video file
      </p>
      <p
        v-if="uploadFile"
        class="video-modal__filename"
      >
        {{ uploadFile.file.name }}
      </p>
      <p class="video-modal__description">
        Pick a frequency to extract frames from this video.
        A high FPS (right) will create more, similar images, while a low one
        will create less but varied imagery.
        <br>
        <br>For object detection, 2 FPS creates variety and low repetition.
        <br>For video tracking datasets, consider choosing 15 FPS or higher.
      </p>
      <div
        class="video-modal__close"
        @click="cancel"
      >
        &#10005;
      </div>
    </div>
    <form
      v-if="uploadFile"
      class="modal-content"
      @submit.prevent="start"
    >
      <div class="video-control">
        <div class="video-control__frames">
          <div class="video-control__radio-container">
            <check-box
              v-model="nativeFrameRate"
              name="native"
              label="Keep the native frame rate"
            />
            <info title="Native frame rate">
              Label at the native frame rate of the video. Note: This may create
              an unnecessary number of frames which take longer to annotate.
            </info>
          </div>
          <div class="video-control__radio-container">
            <label class="video-control__frames-summary">{{ formattedMessage }}</label>
            <info title="Frames per Second">
              How frequently do you want frames of your video to be extracted.
              A high frequency (right) will create more, similar images, while a
              low one will create less, but more varied imagery.
            </info>
          </div>
        </div>
        <div class="video-control__slider-container">
          <slider
            ref="slider"
            v-model="selectedValue"
            class="video-control__slider"
            :options="{
              data: friendlySelectionRange,
              marks,
              useKeyboard: true,
              disabled: nativeFrameRate,
              tooltip: 'none'
            }"
          >
            <template #dot="{ value }">
              <div class="video-control__slider-dot">
                {{ value }}
              </div>
            </template>
          </slider>
          <div
            v-if="warningMessage"
            class="video-control__warning"
          >
            {{ warningMessage }}
          </div>
        </div>
        <div class="video-control__radio-container">
          <radio
            class="video-control__radio"
            name="annotate_as_video"
            value="annotation_as_video"
            :selected="!annotateAsFrames"
            label="Annotate as a video"
            @click="annotateAsFrames = false"
          />
          <info>
            Scrub through the video and interpolate labels. 1 video is counted
            as a single task. Annotation persist between frames unless deleted
            or hidden.
          </info>
        </div>
        <div class="video-control__radio-container">
          <radio
            class="video-control__radio"
            label="Annotate as individual images"
            name="annotation_as_image"
            value="annotation_as_image"
            :selected="annotateAsFrames"
            @click="annotateAsFrames = !annotateAsFrames"
          />
          <info>
            Import frames as individual images. Each frame is counted as a
            single task. Annotations do not carry over between images unless
            copied.
          </info>
        </div>
      </div>
    </form>
    <div class="modal-footer">
      <secondary-button
        class="video-modal__cancel"
        @click="cancel"
      >
        Cancel
      </secondary-button>
      <positive-button
        class="video-modal__upload"
        @click="start"
      >
        Upload
      </positive-button>
    </div>
  </modal>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'
import Radio from '@/components/Common/Radio.vue'
import Slider from '@/components/Common/Slider/V1/Slider.vue'
import { UploadFile } from '@/store/modules/datasetUpload/types'

const inclusiveRange = (low: number, high: number) => {
  return Array.from(Array(high + 1 - low), (_, i) => i + low)
}

const multiply = (range: number[], factor: number) => {
  if (factor <= 1) { return range }
  return range.map(x => Array.from(Array(factor), () => x)).flat()
}

@Component({
  name: 'video-settings-modal',
  components: { CheckBox, Info, Slider, Radio }
})
export default class VideoSettingsModal extends Vue {
  @Prop({ required: true, default: null })
  uploadFile!: UploadFile | null

  selectedValue: string = '1'
  annotateAsFrames: boolean = false
  nativeFrameRate: boolean = false

  @Watch('uploadFile', { immediate: true })
  onUploadFile (uploadFile?: UploadFile) {
    if (!uploadFile) { return }
    this.$store.dispatch('datasetUpload/getVideoInfo', uploadFile)
  }

  get duration () {
    return this.uploadFile && this.uploadFile.data.duration
      ? Math.min(60, Math.floor(this.uploadFile.data.duration))
      : 60
  }

  get videoFramerate () {
    return this.uploadFile && this.uploadFile.data.framerate
      ? Math.min(60, this.uploadFile.data.framerate)
      : 60
  }

  get lowerRange () {
    const baseRange = inclusiveRange(2, this.duration).reverse()
    const multiplicationFactor = Math.floor(this.videoFramerate / this.duration)
    return multiply(baseRange, multiplicationFactor)
  }

  get higherRange () {
    const baseRange = inclusiveRange(1, this.videoFramerate)
    const multiplicationFactor = Math.floor(this.duration / this.videoFramerate)
    return multiply(baseRange, multiplicationFactor)
  }

  get friendlySelectionRange () {
    return [...this.lowerRange.map(x => `1/${x}`), ...this.higherRange.map(x => x.toString())]
  }

  get actualSelectionRange (): number[] {
    return [...this.lowerRange.map(x => 1 / x), ...this.higherRange]
  }

  get actualValue (): number {
    const friendlyValue = this.selectedValue
    const index = this.friendlySelectionRange.indexOf(friendlyValue)
    return this.actualSelectionRange[index]
  }

  get totalFrames (): number {
    const { actualValue, duration } = this
    return Math.max(Math.ceil(actualValue * duration), 1)
  }

  get formattedMessage (): string {
    const { actualValue, totalFrames } = this
    const friendlyValue = this.selectedValue

    const rate = Math.floor(1 / actualValue)

    return (actualValue >= 1)
      ? `Extract ${friendlyValue} frames per second, for a total of ${totalFrames} images.`
      : `Extract 1 frame every ${rate} seconds for a total of ${totalFrames} images.`
  }

  get warningMessage (): string | null {
    const { annotateAsFrames, totalFrames } = this
    if (annotateAsFrames) { return null }
    if (totalFrames >= 2000) {
      return [
        'Your video may load slowly as it exceeds 2,000 frames,',
        'if annotations were to be placed on every frame.'
      ].join(' ')
    }
    return null
  }

  get marks (): [string, string, string] {
    return [`1/${this.duration}`, '1', `${this.videoFramerate}`]
  }

  cancel (): void {
    this.$modal.hide('video-modal')
    this.$emit('cancel', { uploadFile: this.uploadFile })
  }

  start (): void {
    this.$modal.hide('video-modal')
    const params = {
      uploadFile: this.uploadFile,
      framerate: this.nativeFrameRate ? 'native' : this.actualValue,
      annotateAsFrames: this.annotateAsFrames
    }
    this.$emit('start', params)
  }
}
</script>

<style lang="scss" scoped>
.video-modal__title {
  @include typography(lg-1, default, bold);
  color: $color90Black;
}

.video-modal__filename {
  margin: 20px;
  @include typography(md-1, default, bold);
  color: $colorAliceNight;
}

.video-modal__description {
  @include typography(md);
  color: $color90Black;
}

.video-modal__close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: $colorSecondaryLight;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}

.video-control {
  width: 100%;
}

.video-control__frames {
  width: 100%;
  @include col;
  position: relative;
  margin: 10px 0;
}

.video-control__frames-summary {
  flex: 1;
  @include typography(md);
  color: $colorAliceNight;
}

.video-control__slider-container {
  width: 100%;
  height: 90px;
}

.video-control__slider {
  margin-bottom: 25px;

  :deep(.vue-slider-mark-label) {
    @include typography(md);
    color: $colorAliceNight;
  }

  :deep(.vue-slider-mark) {
    .vue-slider-mark-step {
      background: transparent;
    }

    &:first-child {
      margin-left: 10px;
    }

    &:last-child {
      margin-left: -5px;
    }
  }
}

.video-control__slider-dot {
  width: 26px;
  height: 26px;
  @include row--center;
  @include typography(sm, default, bold);
  border-radius: 50%;
  background: $colorFeatherLight;
  color: $colorWhite;
  filter: drop-shadow(0px 3px 5px rgba(145, 169, 192, 0.3));
  cursor: pointer;
}

.video-control__radio-container {
  width: 100%;
  @include row--distributed--center;
  margin-top: 10px;
}

.video-control__warning {
  width: 100%;
  margin-bottom: 10px;
  @include typography(sm);
  color: $colorCrimsonLight;
}

.video-control__radio {
  flex: 1;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.video-modal {
  @include col;
  position: relative;
  border-radius: 10px;
  background: white;
  min-height: 550px;

  .modal-header {
    width: 100%;
    border-radius: 10px 10px 0 0;
    @include col;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    padding: 30px 50px 10px;
  }

  .modal-content {
    flex: 1;
    @include col;
    justify-content: flex-start;
    align-items: center;
    padding: 0 50px 0px;
  }

  .modal-footer {
    width: 100%;
    height: 100px;
    background: $colorWhite;
    border-radius: 0 0 10px 10px;
    @include row--center;
  }

  .video-modal__cancel,
  .video-modal__upload {
    margin: 0 10px;
  }
}
</style>
