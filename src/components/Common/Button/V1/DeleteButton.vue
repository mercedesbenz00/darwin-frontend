<template>
  <button
    class="trash"
    type="button"
    @click.stop="$emit('click')"
  >
    <trash-icon class="trash__icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TrashIcon from '@/components/Common/Button/V1/assets/trash.svg?inline'

export default defineComponent({ name: 'DeleteButton', components: { TrashIcon } })
</script>

<style lang="scss" scoped>
.trash {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  @include row--center;
  outline: none;
  border: none;
  background: transparent;
  padding: 0;

  transition: background-color .2s ease;
}

.trash:hover {
  background: $colorAliceShade;
}

.trash:active {
  background: $colorAliceShadow;
}

.trash__icon {
  height: 50%;
  width: auto;
}
</style>
