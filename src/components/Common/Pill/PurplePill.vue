<template>
  <pill-base class="purple-pill">
    <slot />
  </pill-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PillBase from './PillBase.vue'

export default defineComponent({ name: 'PurplePill', components: { PillBase } })
</script>

<style lang="scss" scoped>
@import "./pill";

.purple-pill {
  @include pill(
    rgba(172, 141, 191, 0.5),
    rgba(170, 137, 190, 0.7),
    rgba(180, 120, 201, 0.35)
  );
}
</style>
