<template>
  <pill-base class="feather-light-pill">
    <slot />
  </pill-base>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import PillBase from './PillBase.vue'

export default defineComponent({ name: 'FeatherLightPill', components: { PillBase } })
</script>

<style lang="scss" scoped>
@import "./pill";

.feather-light-pill {
  @include pill(
    rgba(0, 217, 201, 0.5),
    rgba(0, 217, 201, 0.7),
    rgba(0, 217, 201, 0.35)
  );
}
</style>
