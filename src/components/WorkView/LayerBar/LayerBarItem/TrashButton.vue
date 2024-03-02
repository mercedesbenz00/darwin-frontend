<template>
  <button
    class="trash-button"
    @click.stop="$emit('click')"
    @dblclick.stop
  >
    <icon-12-trash />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { Icon12Trash } from '@/assets/icons/V2/12'

export default defineComponent({
  name: 'TrashButton',
  components: { Icon12Trash }
})
</script>

<style lang="scss" scoped>
.trash-button {
  @include row--center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;

  &:hover, &:active {
    :deep(svg) path {
      fill: $colorInteractivePrimaryDefault;
      stroke: $colorInteractivePrimaryDefault;
    }
  }
}
</style>
