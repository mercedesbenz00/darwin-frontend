<template>
  <div class="placeholder">
    <div
      v-loading="true"
      class="placeholder__loader"
      :loading-options="{
        label: null,
        size: 'small',
        backgroundColor: 'transparent'
      }"
    />
  </div>
</template>

<script lang="ts">
/**
 * @Component WorkviewImagePlaceholder
 * ~ Show a placeholder in place of the workview image
 */
import { defineComponent } from 'vue'
export default defineComponent({ name: 'BottomBarPlaceholder' })
</script>

<style lang="scss" scoped>
.placeholder {
  position: absolute;
  @include col--center;
  vertical-align: middle;
  align-items: center;
  height: 100%;
  width: 72px;
  border-radius: $border-radius-default;
  background: $colorSecondaryLight2;
  cursor: pointer;
  &__loader {
    position: relative;
    height: 30px;
    width: 30px;
  }
}
</style>
