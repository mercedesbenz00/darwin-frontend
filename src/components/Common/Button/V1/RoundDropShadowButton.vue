<template>
  <button
    class="round-drop-shadow-button"
    v-on="$listeners"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Simple round buttomn with non-specific height, where the content is given as
 * a slot.
 *
 * The actuall shared style is
 * - the slot content is scaled to max height and weight, as well as centered
 * - the button has a defined filter drop-shadow
 */
export default defineComponent({ name: 'RoundDropShadowButton' })
</script>

<style lang="scss" scoped>

.round-drop-shadow-button {
  border-radius: 50%;

  padding: 0;

  display: grid;
  align-items: stretch;
  justify-content: stretch;

  cursor: pointer;
  transition: filter .2s linear;

  &:hover {
    filter: drop-shadow(0px 10px 10px rgba(145, 169, 192, 0.3));
  }

  & > * {
    height: 100%;
    width: 100%;
  }
}
</style>
