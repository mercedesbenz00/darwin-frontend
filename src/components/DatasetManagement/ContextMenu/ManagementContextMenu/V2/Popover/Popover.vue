<template>
  <div
    v-if="show"
    class="popover"
  >
    <slot />
    <popover-search
      v-bind="$attrs"
      v-on="$listeners"
      :value="inputValue"
      @change="(val) => $emit('on-input', val)"
    >
      <template #left-icon>
        <slot name="left-icon" />
      </template>
      <template #right-icon>
        <slot name="right-icon" />
      </template>
    </popover-search>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

import PopoverSearch from './PopoverSearch/PopoverSearch.vue'

/**
 * @Component Popover
 * ~ Popover wrapper which is being used by the ContextMenuPopover[TYPE] components. The component
 * accepts all input props and slots which you could pass to <input-field-v2 />.
 * @param {string} prop
 * */

export default defineComponent({
  name: 'Popover',
  components: { PopoverSearch },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    inputValue: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    return {
      props
    }
  }
})
</script>

<style lang='scss' scoped>
.popover {
  position: absolute;
  bottom: 44px;
  left: 0;

  width: 228px;
  height: auto;
  max-height: 324px;

  display: block;
  background: $colorNeutralsLightWhite;

  border: 1px solid $colorNeutralsLight300;
  border-radius: 10px;

  box-shadow: $effectShadowsXS;
  z-index: 1;

  overflow-y: scroll;
  overflow-x: hidden;

  @include hidden-scrollbar;
}
</style>
