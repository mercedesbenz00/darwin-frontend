<template>
  <action-bar-element
    type="danger"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #prefixComp>
      <icon-duotone-trash />
    </template>
    <p class="action-bar-el__label">
      {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
    </p>
  </action-bar-element>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

import { IconDuotoneTrash } from '@/assets/icons/V2/Duotone'

import ActionBarElement from './ActionBarElement.vue'
import { DangerMode } from './types'

/**
 * @Component ActionBarDanger
 * ~ Danger version of ActionBarElement. Component will be used inside ManagementContextMenu
 * */

export default defineComponent({
  name: 'ActionBarDanger',
  components: { ActionBarElement, IconDuotoneTrash },
  props: {
    mode: {
      type: String,
      default: DangerMode.ARCHIVE
    }
  }
})
</script>

<style lang='scss' scoped>
.action-bar-el__label {
  @include typography(md-1, inter, 500);
  color: $colorStatusNegative;
}
</style>
