<template>
  <div class="thumbnail-cropper">
    <vue-croppie
      ref="cropper"
      class="thumbnail-cropper__cropper"
      :enable-resize="false"
      :max-zoom="ZOOM_MAX"
      :min-zoom="ZOOM_MIN"
      :show-zoomer="false"
      :viewport="viewport"
      @update="updateCrop"
      @result="updateCropData"
    />
    <div
      v-if="imageLoading"
      class="thumbnail-cropper__cropper-loading"
    >
      <circle-spinner />
    </div>
    <div class="thumbnail-cropper__controls">
      <slider
        v-if="sliderZoom"
        :value="sliderZoom"
        :options="sliderOptions"
        @change="onScaleChange"
      />
      <label>Zoom</label>
    </div>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import Slider from '@/components/Common/Slider/V1/Slider.vue'

import {
  CropInfo, Croppie, PendingClassImageWithUrlSet,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT
} from './types'

/**
 * Computes initial scale where the image will be fully zoomed out, with the
 * crop area centered on top of it.
*/
const initialScale = (image: PendingClassImageWithUrlSet): number => {
  const { image_height: height, image_width: width } = image
  if (!height || !width) { return 1 }
  const horizontal = VIEWPORT_WIDTH / width
  const vertical = VIEWPORT_HEIGHT / height

  /** Whichever scale fits the image exactly is the one we use */
  return horizontal * height < VIEWPORT_HEIGHT
    ? vertical
    : horizontal
}

const COEFF_SLIDER: number = 100
const cropperToSlider = (value: number): number => value * COEFF_SLIDER
const sliderToCropper = (value: number): number => value / COEFF_SLIDER

const cropOptions = (
  image: PendingClassImageWithUrlSet
): Omit<CropInfo, 'orientation'> & { url: string } => {
  const url = image.original_image_url
  const scale = image.scale || initialScale(image)

  let x = 0
  let y = 0
  if (image.x) {
    x = image.x
  } else if (image.image_width) {
    x = image.image_width / 2 - VIEWPORT_WIDTH / scale / 2
  }
  if (image.y) {
    y = image.y
  } else if (image.image_height) {
    y = image.image_height / 2 - VIEWPORT_HEIGHT / scale / 2
  }

  return {
    url,
    zoom: scale,
    points: [
      x.toString(),
      y.toString(),
      (x + VIEWPORT_WIDTH / scale).toFixed(0),
      (y + VIEWPORT_HEIGHT / scale).toFixed(0)
    ]
  }
}

@Component({
  name: 'thumbnail-cropper',
  components: { Slider, CircleSpinner }
})
export default class ThumbnailCropper extends Vue {
  $refs!: {
    cropper?: Vue & Croppie
  }

  readonly ZOOM_MIN: number = 0
  readonly ZOOM_MAX: number = 2.5

  @Prop({
    required: true,
    type: Object as () => PendingClassImageWithUrlSet
  })
  image!: PendingClassImageWithUrlSet

  readonly viewport = {
    height: VIEWPORT_HEIGHT,
    type: 'square',
    width: VIEWPORT_WIDTH
  }

  imageLoading: boolean = false

  mounted () {
    this.setCroppie()
  }

  @Watch('image.original_image_url')
  onImageUrl () { this.setCroppie() }

  @Watch('image.image_width')
  onImageWidth () { this.setCroppie() }

  @Watch('image.image_height')
  onImageHeight () { this.setCroppie() }

  setCroppie () {
    this.imageLoading = true

    this.$nextTick(() => {
      const { image, $refs } = this
      if (!$refs.cropper) { return }

      const options = cropOptions(image)
      $refs.cropper.bind(options)
    })
  }

  updateCrop (info: CropInfo) {
    this.imageLoading = false

    const { zoom: scale } = info

    const x = parseInt(info.points[0])
    const y = parseInt(info.points[1])

    const newImage: PendingClassImageWithUrlSet = {
      ...this.image,
      scale,
      x,
      y
    }

    this.$emit('update', newImage)
    this.requestCropDebounced()
  }

  requestCrop () {
    // since the function operates on a debounce, need to make sure user
    // didn't close the dialog before we got here
    if (!this.$refs.cropper) { return }
    this.$refs.cropper.result({ type: 'blob' })
  }

  requestCropDebounced = debounce(this.requestCrop, 2000)

  updateCropData (data: Blob) {
    this.$emit('crop', this.image, data)
  }

  get sliderOptions () {
    return {
      height: 2,
      dotSize: 20,
      min: cropperToSlider(this.ZOOM_MIN),
      max: cropperToSlider(this.ZOOM_MAX),
      speed: 1,
      interval: 1,
      tooltip: 'none',
      dotStyle: {
        background: this.$theme.getColor('color90Black'),
        borderColor: this.$theme.getColor('color90Black')
      },
      railStyle: {
        background: 'url("/static/imgs/slider-track/alice-shadow.svg")',
        backgroundPosition: 'center'
      }
    }
  }

  get sliderZoom (): number | null {
    const { image } = this
    if (!image.scale) { return null }
    return cropperToSlider(image.scale)
  }

  onScaleChange (val: number) {
    if (!this.$refs.cropper) { return }
    this.$refs.cropper.setZoom(sliderToCropper(val))
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="css">
@import 'croppie/croppie.css';
</style>

<style lang="scss" scoped>
.thumbnail-cropper {
  display: grid;
  grid-template-rows: 250px auto auto;
  row-gap: 15px;
}

.thumbnail-cropper__cropper,
.thumbnail-cropper__cropper-loading,
.thumbnail-cropper__placeholder {
  grid-column: 1;
  grid-row: 1;
  height: 100%;
  width: 100%;
}

.thumbnail-cropper__cropper-loading {
  z-index: 1;
}

.thumbnail-cropper__controls {
  grid-column: 1;
  grid-row: 2;

  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 20px;
  align-items: center;
  justify-content: space-between;
}
</style>
