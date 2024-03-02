<template>
  <action-bar-element
    type="select"
    :active="active"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #prefixComp>
      <check-box-v2 :value="active" />
    </template>
    <p
      class="action-bar-el__label"
      :class="{ ['action-bar-el__label--active']: active }"
    >
      Select All
    </p>
  </action-bar-element>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from 'vue'

import CheckBoxV2 from '@/components/Common/CheckBox/V2/CheckBox.vue'

import ActionBarElement from './ActionBarElement.vue'

/**
 * @Component ActionBarSelect
 * ~ Select version of ActionBarElement. Component will be used inside ManagementContextMenu
 * @param {string} active Activates checkbox and changes appearance
 * */

export default defineComponent({
  name: 'ActionBarSelect',
  components: {
    ActionBarElement,
    CheckBoxV2
  },
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  setup (props, context: SetupContext) {
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
</style>
