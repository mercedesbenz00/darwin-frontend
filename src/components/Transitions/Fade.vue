<template>
  <transition name="fade">
    <slot />
  </transition>
</template>

<script lang="ts">
/**
 * @FadeTransition
 * Custom simple fade transition to fade components in and out
 * */
export default { name: 'FadeTransition' }
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 125ms;
  transition-timing-function: ease;
  transition-property: all;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
