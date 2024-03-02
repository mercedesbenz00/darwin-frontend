<template>
  <type-details>
    <template #graphic>
      <video
        class="video"
        src="https://darwin-public.s3.eu-west-1.amazonaws.com/animals_website_small.mp4"
        autoplay
        loop
      />
    </template>
    <h3>Classification</h3>
    <p>
      Labels an image with a single tag. This network does not apply multiple tags to a given image.
    </p>
    <p>
      Classifiers are quick to train and very reliable on uniform datasets.
      They provide the most likely tag given an image, based on its pixel content.
    </p>
    <p>
      Ensure your data is uniform, and that your tag’s visual features take up at least half
      the image’s pixel area for classifications to be accurate.
    </p>
    <div class="input-output">
      <label>Uses:</label>
      <div>
        <type-icon
          type="tag"
          :color="iconColor"
        />
      </div>
      <label>Makes:</label>
      <div>
        <type-icon
          type="tag"
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
  name: 'classification-details',
  components: { TypeDetails, TypeIcon }
})
export default class ClassificationDetails extends Vue {
  get iconColor (): string {
    return this.$theme.getColor('colorFeatherLight')
  }
}
</script>

<style lang="scss" scoped>
.video {
  width: 100%;
  transform: translateY(-43%);
}
</style>
