<template>
  <div class="sigma">
    <sigma-svg-icon />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import SigmaSvgIcon from '@/assets/icons/V1/sigma.svg?inline'

export default defineComponent({ name: 'SigmaIcon', components: { SigmaSvgIcon } })
</script>

<style lang="scss" scoped>
.sigma {
  border-radius: 50%;
  height: 35px;
  width: 35px;
  border: 2px solid $colorAssignedBlue;
  @include typography(md-1, default, bold);

  color: $colorSecondaryLight;

  @include row;
  justify-content: center;
  align-items: center;

  svg {
    height: 55%;
    width: 55%;
  }
}

</style>
