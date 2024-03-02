<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="10"
      r="6"
      :stroke="returnFill.b"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16 10C16 8.4087 15.3679 6.88258 14.2426 5.75736C13.1174 4.63214 11.5913 4 10 4C8.4087
      4 6.88258 4.63214 5.75736 5.75736C4.63214 6.88258 4 8.4087 4 10L10 10H16Z"
      :fill="returnFill.a"
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
  name: 'IconDuotoneIdle',
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
