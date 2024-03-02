<template>
  <div class="error-tip">
    <warning-icon class="error-tip__icon" />
    <span class="error-tip__content"><slot /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import WarningIcon from './assets/warning.svg?inline'

export default defineComponent({
  name: 'ErrorTip',
  components: { WarningIcon }
})
</script>

<style lang="scss" scoped>
.error-tip {
  @include row;
  align-items: center;
  background: rgba(255, 227, 227, 0.5);
  border-radius: 8px;
  padding: 2px;
}

.error-tip__icon {
  width: 12px;
  min-width: 12px;
  height: 12px;
}

.error-tip__content {
  margin-left: 4px;
  @include typography(sm);
  color: $colorCrimson;
}
</style>
