<template>
  <action-bar-element
    type="default"
    :active="active && !disabled"
    :disabled="!!disabled"
    :class="{ ['action-bar-el-disabled']: !!disabled }"
    id="action-bar-el"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #prefixComp>
      <slot />
    </template>
    <template #default>
      <p
        class="action-bar-el__label"
        :class="{ ['action-bar-el__label--active']: active && !disabled }"
      >
        Restore
      </p>
    </template>
  </action-bar-element>
</template>

<script lang="ts">
import { defineComponent, onMounted, SetupContext } from 'vue'

import { getElement } from '@/utils/getElement'

import ActionBarElement from './ActionBarElement.vue'
import { ActionBarElement as Types } from './types'

/**
 * @Component ActionBarDefault
 * ~ Default version of ActionBarElement. Component will be used inside ManagementContextMenu
 * @param {string} active Changes appearance depending on element is active or not.
 * */

export default defineComponent({
  name: 'ActionBarRestore',
  components: {
    ActionBarElement
  },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: String,
      default: null
    }
  },
  setup (props: Omit<Types, 'type'>, context: SetupContext) {
    onMounted(() => {
      if (!props.disabled) {
        return null
      }

      const el = getElement('action-bar-el')
      if (el) {
        el.setAttribute('data-value', props.disabled)
      }
    })

    return {
      props,
      context
    }
  }
})
</script>

<style lang="scss" scoped>
.action-bar-el__label {
  transition: all 175ms ease;

  @include typography(md-1, inter, 500);
  color: $colorContentDefault;

  &--active {
    color: $colorInteractivePrimaryDefault;
  }
}

.action-bar-el-disabled {
  :deep(p) {
    color: $colorContentDisabled;
  }

  &::after {
    transition: opacity 175ms ease;

    position: absolute;
    bottom: 32px;
    left: -88px;

    @include typography(sm, inter, 500);
    color: $colorContentInverted;
    text-align: left;

    width: 216px;
    height: auto;

    padding: 6px 8px;
    border-radius: 4px;

    display: block;
    content: attr(data-value);
    background: $colorSurfaceInverted;

    pointer-events: none;
    opacity: 0;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}
</style>
