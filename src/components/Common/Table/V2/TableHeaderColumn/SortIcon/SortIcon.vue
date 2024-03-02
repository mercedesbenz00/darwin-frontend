<template>
  <div class="sort-icon__wrapper">
    <icon-mono-sort :style="style" />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { IconMonoSort } from '@/assets/icons/V2/Mono'

import { SortMode } from './types'

export default defineComponent({
  name: 'SortIcon',
  components: { IconMonoSort },
  props: {
    mode: {
      required: true,
      type: String as PropType<SortMode>
    }
  },
  setup (props) {
    const style: Ref<{ transform: string }> = computed(() => {
      return {
        transform: `rotate(${props.mode === SortMode.DESC ? '0' : '180'}deg)`
      }
    })
    return {
      style
    }
  }
})
</script>

<style lang="scss" scoped>
.sort-icon__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;
  border-radius: 6px;

  transition: background 150ms ease;
  background: transparent;

  &:hover {
    background: $colorOverlayHover;
  }
}
</style>
