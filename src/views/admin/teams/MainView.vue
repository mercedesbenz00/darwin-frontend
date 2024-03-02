<template>
  <div class="admin__content">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'MainView' })
</script>

<style lang="scss" scoped>
.admin__content {
  @include col;
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
