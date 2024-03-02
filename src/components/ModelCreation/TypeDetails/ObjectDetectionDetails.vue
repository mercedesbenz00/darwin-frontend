<template>
  <type-details>
    <template #graphic>
      <video
        class="video"
        :src="videoUrl"
        autoplay
        loop
      />
    </template>
    <h3>Object Detection</h3>
    <p>
      Object detectors draw a bounding box around each item.
    </p>
    <p>
      They will detect small or medium sized individual objects,
      but perform less well on diagonal, or irregularly shaped items.
      For those, try instance segmentation instead.
    </p>
    <p>
      This network type is ideal for objects that take up between 80% and 2% of an image's area.
    </p>
    <div class="input-output">
      <label>Uses:</label>
      <div>
        <type-icon
          type="polygon"
          :color="iconColor"
        />
        <type-icon
          type="bounding_box"
          :color="iconColor"
        />
      </div>
      <label>Makes:</label>
      <div>
        <type-icon
          type="bounding_box"
          :color="iconColor"
        />
      </div>
    </div>
  </type-details>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import TypeIcon from '@/components/Common/AnnotationType/TypeIcon.vue'

import TypeDetails from './TypeDetails.vue'

@Component({
  name: 'object-detection-details',
  components: { TypeDetails, TypeIcon }
})
export default class ObjectDetectionDetails extends Vue {
  get iconColor (): string {
    return this.$theme.getColor('colorFeatherLight')
  }

  videoUrl =
    'https://darwin-public.s3.eu-west-1.amazonaws.com/splash_page/cars-object-detection_0.8.mp4'
}
</script>

<style lang="scss" scoped>
.video {
  width: 100%;
  height: 100%;
}
</style>
