<template>
  <li class="item">
    <IconMonoWarn /> Wrong Class
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IconMonoWarn } from '@/assets/icons/V2/Mono'

export default defineComponent({
  name: 'ReasonItem',
  components: { IconMonoWarn }
})
</script>

<style lang="scss" scoped>
@import '@/uiKit/assets/index.scss';

.item {
  @include typographyRegularBody25;
  background-color: $colorStatusNegativeContent;
  border-radius: $borderRadius3;
  color: $colorContentInverted;
  padding: $spacing-1 $spacing-2;

  display: flex;
  align-content: center;
  gap: 2px;

  :deep(svg) {
    width: 12px;
    height: 12px;

    * {
      stroke: $colorContentInverted;
    }
  }
}
</style>
