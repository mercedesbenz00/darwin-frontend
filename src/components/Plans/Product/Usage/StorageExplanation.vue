<template>
  <product-explanation>
    <template #title>
      <header-4>How is storage calculated?</header-4>
    </template>
    <template #body>
      <paragraph-12>
        <strong>Managed files</strong> include single images, extracted video
        frames, medical image slices, or single document pages that are annotated
        or in a workflow. Empty stored files are not counted in this limit. For
        example if you only label 5 images in a 100 image dataset, you are
        managing 5 files.
      </paragraph-12>
      <paragraph-12>
        1 file is assumed to be up to 25 million pixels, or up to 6 video frames.
        Files in higher resolution amount to +1 for each 25 megapixels. Video
        frames at 5fps or faster count as 1/6th of a file. Deleting files
        permanently will free up storage.
      </paragraph-12>
      <paragraph-12>
        You may edit your Annotation plan to increase your team’s managed
        allowance.
      </paragraph-12>
    </template>
  </product-explanation>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Header4 from '@/components/Common/Header4.vue'
import Paragraph12 from '@/components/Common/Paragraph12.vue'

import ProductExplanation from './ProductExplanation.vue'

export default defineComponent({
  name: 'StorageExplanation',
  components: {
    Header4,
    Paragraph12,
    ProductExplanation
  }
})
</script>
