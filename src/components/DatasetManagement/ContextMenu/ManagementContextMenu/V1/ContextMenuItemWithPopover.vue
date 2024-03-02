<template>
  <v-popover
    placement="top"
    trigger="click"
    :container="false"
    :disabled="disabled"
    :offset="1"
    :popover-class="popoverClass"
  >
    <gallery-context-menu-item
      class="popover-context-menu"
      :disabled="disabled"
      :label="label"
    >
      <slot name="icon" />
    </gallery-context-menu-item>
    <template #popover>
      <div class="popover-context-menu__menu">
        <slot name="popover" />
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'

@Component({
  name: 'context-menu-item-with-popover',
  components: { GalleryContextMenuItem }
})
export default class ContextMenuItemWithPopover extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: true, type: String })
  label!: string

  @Prop({ required: true, type: String })
  popoverClass!: string
}
</script>

<style lang="scss" scoped>
.popover-context-menu {
  height: 100%;
}

.popover-context-menu__menu {
  display: grid;
  grid-template-rows: auto auto auto auto;
  overflow: hidden;
  margin: 7px 0;
  justify-items: stretch;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover-context-menu__popover {
  @include dropdownAbove;

  overflow: hidden;
  top: 5px !important;

  .popover-inner {
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
