<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 14L10 11L15 14"
      :stroke="returnFill.b"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5 8L10 5L15 8"
      :stroke="returnFill.b"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconVariant } from '@/assets/icons/V2/Mono/types'
import { iconScheme } from '@/assets/icons/V2/variantScheme'

export default defineComponent({
  name: 'IconMonoPriority',
  props: {
    variant: {
      type: String,
      default: IconVariant.DEFAULT
    }
  },
  setup (props: { variant: IconVariant }) {
    const returnFill = computed(() => {
      return iconScheme(props.variant)
    })

    return {
      returnFill
    }
  }
})
</script>
