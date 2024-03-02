<template>
  <div class="panel">
    <div
      v-for="(_slot, name) in $slots"
      :key="name"
      class="panel__section"
      :class="`panel__section--${name}`"
    >
      <slot :name="name" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'PanelFloatingWhite' })
</script>
<style scoped lang="scss">
@import '@/uiKit/assets/index.scss';

.panel {
  border: 1px solid $colorStrokeStrong;
  background: $colorSurfaceDefault;
  border-radius: $borderRadius12;
  max-width: 100%;

  box-shadow: $boxShadowXS;

  &__section {
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;

    &:not(:last-child) {
      border-bottom: 1px solid $colorStrokeElevate;
    }
  }

}
</style>
