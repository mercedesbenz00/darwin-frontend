<template>
  <type-details>
    <template #graphic>
      <video
        class="video"
        src="https://darwin-public.s3-eu-west-1.amazonaws.com/juice_boxes_1.mp4"
        autoplay
        loop
      />
    </template>
    <h3>Instance Segmentation</h3>
    <p>Encloses each individual object in a polygon. This network also provides bounding boxes.</p>
    <p>
      Unlike semantic segmentation, instances can distinguish two adjacent objects from one another.
    </p>
    <p>
      Similar in speed to object detection.
      Higher in accuracy in cases of overlapping, diagonal, or curved objects.
    </p>
    <div class="input-output">
      <label>Uses:</label>
      <div>
        <type-icon
          type="polygon"
          :color="iconColor"
        />
      </div>
      <label>Makes:</label>
      <div>
        <type-icon
          type="polygon"
          :color="iconColor"
        />
        <type-icon
          type="bounding-box"
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
  name: 'instance-segmentation-details',
  components: { TypeDetails, TypeIcon }
})
export default class InstanceSegmentationDetails extends Vue {
  get iconColor (): string {
    return this.$theme.getColor('colorFeatherLight')
  }
}
</script>

<style lang="scss" scoped>
.video {
  width: 100%;
  height: 100%;
}
</style>
