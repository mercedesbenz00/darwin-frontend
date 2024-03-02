<template>
  <div
    :style="{
      'display': 'block',
      'width': `${dimensions.width}px`,
      'height': `${dimensions.height}px`
    }"
  >
    <content-loader
      :primary-color="primaryColor"
      :secondary-color="secondaryColor"
      :width="`${dimensions.width}px`"
      :height="`${dimensions.height}px`"
      :viewBox="`0 0 ${dimensions.width} ${dimensions.height}`"
    >
      <rect
        :width="dimensions.width"
        :height="dimensions.height"
        rx="4"
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

type RectDimensions = {
  width: number
  height: number
}
/**
 * @Component RectContentLoader
 * @param {Object} dimensions - The dimensions of the rect
 * @param {Number} dimensions.width
 * @param {Number} dimensions.height
 * */

export default defineComponent({
  name: 'RectContentLoader',
  components: { ContentLoader },
  props: {
    dimensions: {
      type: Object as () => RectDimensions,
      default: () => ({ width: 34, height: 28 })
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
