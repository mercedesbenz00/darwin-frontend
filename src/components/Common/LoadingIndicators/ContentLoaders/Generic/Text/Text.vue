<template>
  <div
    :style="{
      'display': 'block',
      'width': `${width}px`,
      'height': `${height}px`
    }"
  >
    <content-loader
      :primary-color="primaryColor"
      :secondary-color="secondaryColor"
      :width="`${width}px`"
      :height="`${height}px`"
      :viewBox="`0 0 ${width} ${height}`"
    >
      <rect
        :width="`${width}px`"
        :height="`${height}px`"
        rx="4"
      />
    </content-loader>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ContentLoader } from 'vue-content-loader'

import { TextContentLoaderProps, TextSize } from './types'
import { useTextLoader } from './useTextLoader'

/**
 * @Component TextContentLoader
 * @param {string} variant Define the TextSize for text content loader
 * @param {number} width Define a width for the content loader
 * */

export default defineComponent({
  name: 'TextContentLoader',
  components: { ContentLoader },
  props: {
    variant: {
      default: TextSize.MD1,
      type: String
    },
    width: {
      default: 100,
      type: Number
    }
  },
  setup (props: TextContentLoaderProps) {
    const { primaryColor, secondaryColor, height } = useTextLoader(props.variant)

    return {
      primaryColor,
      secondaryColor,
      height
    }
  }
})
</script>
