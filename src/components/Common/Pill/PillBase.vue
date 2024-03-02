<template>
  <div class="pill">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Base component for a pill element. Should be reused by derived components.
 *
 * Not to be used directly outside of other pill components.
 */
export default defineComponent({ name: 'ConfirmationDialogLayout' })
</script>

<style lang="scss" scoped>
.pill {
  box-sizing: border-box;
  border-radius: 5px;
  @include typography(xs, mulish, bold);

  padding: 0 4px;

  color: $colorBlack;
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
}
</style>
