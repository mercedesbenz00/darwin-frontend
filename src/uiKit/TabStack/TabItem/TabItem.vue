<template>
  <button
    class="tab"
    :class="{
      [`tab--${size}`]: true,
      ['tab-active']: active,
    }"
    v-bind="$attrs"
  >
    <svg
      v-if="active"
      class="tab__corner tab__corner--left"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 0C8 4.41828 4.41828 8 4.76837e-07 8L8 8V0Z"
        fill="white"
      />
    </svg>
    <div class="tab__content">
      <p class="tab__label">
        {{ label }}
      </p>
    </div>
    <svg
      v-if="active"
      class="tab__corner tab__corner--right"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 0C0 4.41828 3.58172 8 8 8L0 8V0Z"
        fill="white"
      />
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { TabItemProps } from './types'

export default defineComponent({
  name: 'TabItem',
  props: {
    label: {
      type: String as () => TabItemProps['label'],
      required: true
    },
    size: {
      type: String as () => TabItemProps['size'],
      required: true
    },
    active: {
      type: Boolean as () => TabItemProps['active'],
      default: false
    }
  },
})
</script>

<style lang="scss" scoped>
.tab {
  transition: background 175ms ease;

  display: flex;
  align-items: center;

  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: 8px 8px 0px 0px;
  position: relative;

  &:hover {
    background: $colorOverlayHover;
  }

  &--small {
    min-width: 17px;
    width: fit-content;
    height: 30px;
  }

  &--large {
    min-width: 25px;
    width: fit-content;
    height: 35px;
  }
}

.tab-active {
  z-index: 1;
  background: $colorNeutralsLightWhite;

  &:hover {
    background: $colorNeutralsLightWhite;
  }
}

.tab__content {
  display: inline-block;

  width: 100%;
  height: fit-content;

  padding: 0 24px;
}

.tab__corner {
  position: absolute;
  bottom: 0px;
  &--left {
    left: -8px;
  }
  &--right {
    right: -8px;
  }
}

.tab__label {
  @include typography(md-1, inter, 500);
  text-align: center;
  color: $colorContentSecondary;
}
</style>
