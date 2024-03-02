<template>
  <secondary-light-button
    v-bind="{ ...$attrs, ...$props }"
    class="mini-secondary-light-button"
    v-on="$listeners"
  >
    <slot>LABEL MISSING!</slot>
  </secondary-light-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import SecondaryLightButton from './SecondaryLightButton.vue'

export default defineComponent({
  name: 'MiniSecondaryLightButton',
  components: { SecondaryLightButton }
})

</script>

<style lang="scss" scoped>
.mini-secondary-light-button {
  height: 26px;
  padding: 2px 8px;
}
</style>
