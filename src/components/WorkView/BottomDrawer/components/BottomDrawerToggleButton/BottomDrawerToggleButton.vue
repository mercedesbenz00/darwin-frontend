<template>
  <div
    class="bottom-drawer__toggle"
  >
    <button
      v-tooltip="tooltip"
      class="bottom-drawer__toggle__button"
      @click="$emit('click')"
    >
      <toggle-chevron-icon
        class="bottom-drawer__toggle__button__icon"
        :class="{'bottom-drawer__toggle__button__icon--collapsed': collapsed}"
      />
    </button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed
} from 'vue'

import { TooltipOptions } from '@/types'

import { ToggleChevronIcon } from './assets/icons'
import { BottomDrawerToggleButtonProps as Type } from './types'

/**
 * @Component BottomDrawerToggleButton
 * ~ the toggle button used to collapse the bottom-drawer
 * @param {string} name used within the tooltip to differentiate between 'image carousel'
 * and 'video annotation' toggle button
 * @param {boolean} collapsed if the bottom-drawer is collapsed or not
 */
// })
export default defineComponent({
  name: 'BottomDrawerToggleButton',
  components: { ToggleChevronIcon },
  props: {
    name: { type: String, default: 'bottom bar' },
    collapsed: { type: Boolean, default: false }
  },
  setup (props: Type) {
    const tooltip = computed((): TooltipOptions => {
      return {
        content: `${props.collapsed ? 'Open ' : 'Close'} ${props.name}`,
        placement: 'top',
        delay: { show: 300, hide: 300 }
      }
    })

    return {
      tooltip
    }
  }
})
</script>

<style lang="scss" scoped>
.bottom-drawer__toggle {
  position: absolute;
  left: 0;
  top: -22px !important;
  width: calc(52px + 16px);
  height: 22px;
  background-color: transparent;
  overflow: hidden;

  &:hover {
    .bottom-drawer__toggle__button {
      transform: translateY(0);
    }
  }

  &__button {
    @include noSelect;
    @include row;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: 100%;
    width: 52px;
    left: calc(50% - 28px);
    top: 0;
    background-color: $colorNeutralsWhite;
    border-radius: 8px 8px 0 0;
    transform: translateY(75%);
    transition: transform .3s ease-in-out;
    z-index: 0;
    cursor: pointer;

    &__icon {
      height: 20px;
      width: 20px;

      &--collapsed {
        transform: rotate(180deg);
      }

      g {
        stroke: $colorContentTertiary;
      }
    }

    &:hover {
      .bottom-drawer__toggle__button__icon g {
        stroke: $colorContentDefault;
      }
    }

    &:active,
    &:focus {
      .bottom-drawer__toggle__button__icon g {
        stroke: $colorContentEmphasis;
      }
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      height: 8px;
      width: 8px;
      background-image: url('./assets/icons/concave.svg');
      background-position: center center;
      background-size: 100%;
      z-index: 3;
    }

    &::before {
      left: -7.5px;
      transform: scaleX(-1);
    }

    &::after {
      right: -7.5px;
    }
  }
}

</style>
