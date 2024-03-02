<template>
  <div class="main">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'EmptyLayout' })
</script>
