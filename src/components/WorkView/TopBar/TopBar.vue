<template>
  <div class="top-bar">
    <div class="top-bar__left-container">
      <top-bar-logo class="top-bar__logo" />
      <slot name="left" />
    </div>
    <div class="top-bar__right-container">
      <div class="top-bar__center">
        <slot name="center" />
      </div>
      <div class="top-bar__right">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TopBarLogo from './components/TopBarLogo.vue'

export default defineComponent({
  name: 'TopBar',
  components: {
    TopBarLogo
  }
})
</script>

<style lang="scss" scoped>
.top-bar {
  @include row--distributed;
  background-color: $colorSecondaryLight3;
  height: 100%;
  border-bottom: 1px solid $colorBorderLight;

  &__logo {
    width: 44px;
  }

  &__left-container,
  &__right-container {
    height: 100%;
    align-self: center;
  }

  &__left-container {
    justify-self: left;
    @include row;
    align-items: center;
    justify-content: flex-start;
  }

  &__right-container {
    flex: 1;
    display: flex;
    max-width: 63%;
  }

  &__center,
  &__right {
    height: 100%;
    align-self: center;
  }

  &__center {
    flex: 1;
    @include row;
    align-items: center;

    & > div:not(:first-child) {
      margin-left: 10px;
    }
  }

  &__right {
    justify-self: right;
    @include row;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }
}
</style>
