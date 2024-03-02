<template>
  <div class="generic-filter-header">
    <div class="generic-filter-header__title">
      <slot name="title" />
    </div>
    <slot name="content" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent
} from 'vue'

export default defineComponent({
  name: 'GenericFilterHeader'
})
</script>

<style lang="scss" scoped>
.generic-filter-header {
  width: 100%;
  @include col;
  align-items: center;
  gap: 4px;

  &__title {
    width: 100%;
    background-color: $colorSurfaceElevate;
    @include typography(md-1, inter, 500);
    color: $colorContentSecondary;
    padding: 4px 12px;
  }
}
</style>
