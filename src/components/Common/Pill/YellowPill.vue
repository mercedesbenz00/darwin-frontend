<template>
  <pill-base class="yellow-pill">
    <slot />
  </pill-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PillBase from './PillBase.vue'

export default defineComponent({ name: 'YellowPill', components: { PillBase } })
</script>

<style lang="scss" scoped>
@import "./pill";

.yellow-pill {
  @include pill(
    rgba(254, 242, 136, 0.5),
    rgba(204, 182, 65, 0.7),
    rgba(255, 238, 81, 0.35)
  );
}
</style>
