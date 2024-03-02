<template>
  <pill-base class="pink-pill">
    <slot />
  </pill-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PillBase from './PillBase.vue'

export default defineComponent({ name: 'PinkPill', components: { PillBase } })
</script>

<style lang="scss" scoped>
@import "./pill";

.pink-pill {
  @include pill(
    rgba(254, 136, 136, 0.5),
    rgba(204, 65, 65, 0.7),
    rgba(255, 81, 81, 0.35)
  );
}
</style>
