<template>
  <div
    :style="{
      'display': 'block',
      'width': `${size}px`,
      'height': `${size}px`
    }"
  >
    <content-loader
      :primary-color="primaryColor"
      :secondary-color="secondaryColor"
      :width="`${size}px`"
      :height="`${size}px`"
      :viewBox="`0 0 ${size} ${size}`"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="size / 2"
      />
    </content-loader>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { ContentLoader } from 'vue-content-loader'

import {
  useContentLoader
} from '@/components/Common/LoadingIndicators/ContentLoaders/useContentLoader'

/**
 * @Component CircleContentLoader
 * @param {string} size Define a size/radius for the circle
 * */

export default defineComponent({
  name: 'CircleContentLoader',
  components: { ContentLoader },
  props: {
    size: {
      type: Number,
      default: 20
    }
  },
  setup () {
    const { primaryColor, secondaryColor } = useContentLoader()

    return {
      primaryColor,
      secondaryColor
    }
  }
})
</script>
