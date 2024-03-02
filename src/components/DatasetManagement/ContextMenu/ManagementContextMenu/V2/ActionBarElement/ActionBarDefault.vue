<template>
  <div class="action-bar-el__wrapper">
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
        <slot name="icon" />
      </template>
      <template #default>
        <slot />
      </template>
    </action-bar-element>
    <slot name="popover" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'

import { getElement } from '@/utils/getElement'

import ActionBarElement from './ActionBarElement.vue'

/**
 * @Component ActionBarDefault
 * ~ Default version of ActionBarElement. Component will be used inside ManagementContextMenu
 * @param {string} active Changes appearance depending on element is active or not.
 * */

export default defineComponent({
  name: 'ActionBarDefault',
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
  setup (props) {
    onMounted(() => {
      if (!props.disabled) {
        return null
      }

      const el = getElement('action-bar-el')
      if (el) {
        el.setAttribute('data-value', props.disabled)
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.action-bar-el__wrapper {
  position: relative;
  display: block;
}

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
}
</style>
