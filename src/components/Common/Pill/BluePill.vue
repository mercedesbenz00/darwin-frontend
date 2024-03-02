<template>
  <pill-base class="blue-pill">
    <slot />
  </pill-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PillBase from './PillBase.vue'

export default defineComponent({ name: 'BluePill', components: { PillBase } })
</script>

<style lang="scss" scoped>
@import "./pill";

.blue-pill {
  @include pill(
    rgba(160, 198, 234, 0.5),
    rgba(72, 130, 243, 0.7),
    rgba(0, 123, 237, 0.35)
  );
}
</style>
