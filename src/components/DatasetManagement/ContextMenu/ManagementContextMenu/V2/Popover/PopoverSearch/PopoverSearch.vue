<template>
  <div class="popover-search">
    <input-field-v2
      v-bind="$attrs"
      v-on="$listeners"
    >
      <template #left-icon>
        <slot name="left-icon" />
      </template>
      <template #right-icon>
        <slot name="right-icon" />
      </template>
    </input-field-v2>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

import InputFieldV2 from '@/components/Common/InputField/V2/InputField.vue'

/**
 * @Component PopoverSearch
 * ~ Reuseable component for the Popover. Basically just a individual styled wrapper with the input
 * in it.
 * */

export default defineComponent({
  name: 'PopoverSearch',
  components: { InputFieldV2 },
  setup (props) {
    return {
      props
    }
  }
})
</script>

<style lang='scss' scoped>
.popover-search {
  position: sticky;
  bottom: 0px;
  left: 0px;

  display: block;
  padding: 6px;
  background: $colorSurfaceElevate;
  box-shadow: $borderLightTop;

  width: 100%;
}
</style>
