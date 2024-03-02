<template>
  <v-popover
    placement="bottom-start"
    popover-class="preset-menu__popover"
    trigger="manual"
    :offset="5"
    :open.sync="open"
  >
    <div
      class="preset-menu__trigger"
      @click.stop.prevent="open = true"
    >
      <slot />
    </div>

    <template #popover>
      <popup-menu class="preset-popup-menu">
        <popup-menu-item @mousedown.native.prevent="onApplyChanges">
          Apply changes
        </popup-menu-item>
        <popup-menu-item @mousedown.native.prevent="onEdit">
          Edit
        </popup-menu-item>
        <popup-menu-item
          theme="crimson"
          @mousedown.native.prevent="onDelete"
        >
          Delete
        </popup-menu-item>
      </popup-menu>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import PopupMenu from '@/components/Common/PopupMenu/V1/PopupMenu.vue'
import PopupMenuItem from '@/components/Common/PopupMenu/V1/PopupMenuItem.vue'

@Component({
  name: 'preset-menu',
  components: { PopupMenu, PopupMenuItem }
})
export default class PresetMenu extends Vue {
  open: boolean = false

  onApplyChanges (): void {
    this.$emit('apply-changes')
    this.open = false
  }

  onEdit (): void {
    this.$emit('edit')
    this.open = false
  }

  onDelete (): void {
    this.$emit('delete')
    this.open = false
  }
}
</script>

<style lang="scss" scoped>
.preset-menu__trigger {
  width: 20px;
  z-index: var(--classes-view-menu);
  cursor: pointer;
  border-radius: 0;
  transition: opacity .2s ease-in-out;

  img {
    width: 100%;
    object-fit: contain;
    border-radius: 0;
  }

  &:hover {
    opacity: 0.5;
  }

  &:active {
    opacity: 0.3;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.preset-menu__popover {
  .popover-inner {
    padding: 0;
    background: transparent;
  }
}
</style>
