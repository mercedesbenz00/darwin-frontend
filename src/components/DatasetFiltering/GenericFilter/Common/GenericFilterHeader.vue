<template>
  <div class="generic-filter-header">
    <div class="generic-filter-header__title">
      <slot name="title" />
    </div>
    <slot name="content" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'GenericFilterHeader' })
</script>

<style lang="scss" scoped>
.generic-filter-header {
  width: 100%;
  @include col;

  &__title {
    @include typography(sm, mulish, bold);
    color: $colorAliceNight;
    padding: 5px;
  }
}
