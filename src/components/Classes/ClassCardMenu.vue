<template>
  <v-popover
    placement="bottom-start"
    popover-class="class-card-menu__popover"
    trigger="manual"
    :offset="5"
    :open.sync="open"
  >
    <div
      class="class-card-menu__trigger"
      @click.stop.prevent="open = true"
    >
      <slot />
    </div>

    <template #popover>
      <popup-menu class="class-card-popup-menu">
        <popup-menu-item
          v-if="isNonDataset"
          @click.native.prevent="onAddToDataset"
        >
          Add To Dataset
        </popup-menu-item>
        <popup-menu-item
          v-else-if="dataset"
          @click.native.prevent="onRemoveFromDataset"
        >
          Remove from Dataset
        </popup-menu-item>
        <popup-menu-item @click.native.prevent="onEdit">
          Edit
        </popup-menu-item>
        <popup-menu-item
          v-tooltip="deleteTooltip"
          theme="crimson"
          @click.native.prevent="onDelete"
        >
          Delete
        </popup-menu-item>
      </popup-menu>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import PopupMenu from '@/components/Common/PopupMenu/V1/PopupMenu.vue'
import PopupMenuItem from '@/components/Common/PopupMenu/V1/PopupMenuItem.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'class-card-menu',
  components: { PopupMenu, PopupMenuItem }
})
export default class ClassCardMenu extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  isNonDataset!: boolean

  @Prop({ required: false, type: Object as () => DatasetPayload, default: null })
  dataset!: DatasetPayload | null

  open: boolean = false

  get deleteTooltip () {
    return this.$can('delete_annotation_class')
      ? undefined
      : {
        content: 'You do not have permissions for this action',
        placement: 'bottom'
      }
  }

  onAddToDataset () {
    this.open = false
    this.$emit('add-to-dataset')
  }

  onRemoveFromDataset () {
    this.open = false
    this.$emit('remove-from-dataset')
  }

  onEdit () {
    this.open = false
    this.$emit('edit')
  }

  onDelete () {
    this.open = false
    this.$emit('delete')
  }
}
</script>

<style lang="scss" scoped>
.class-card-menu__trigger {
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
.class-card-menu__popover {
  .popover-inner {
    padding: 0;
    background: transparent;
  }
}
</style>
