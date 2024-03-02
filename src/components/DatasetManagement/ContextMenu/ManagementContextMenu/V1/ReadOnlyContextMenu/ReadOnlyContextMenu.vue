<template>
  <gallery-context-menu v-if="isSelecting">
    <gallery-context-menu-item
      class="readonly-context-menu__selected"
      :label="`${selectedCount} Selected`"
    />
  </gallery-context-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import GalleryContextMenu from '@/components/Common/Gallery/GalleryContextMenu.vue'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { DatasetItemPayload } from '@/store/types'

/**
 * Used to render a context menu in open datasets (base and video).
 */
@Component({
  name: 'workflow-read-only-context-menu',
  components: { GalleryContextMenu, GalleryContextMenuItem }
})
export default class ReadOnlyContextMenu extends Vue {
  @State(state => state.dataset.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State(state => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  /**
   * Returns the currently selected items.
   *
   * Can be used by parent components through a reference.
   */
  get selectedItems (): DatasetItemPayload[] {
    return this.datasetItems.filter(i => this.selectedItemIds.includes(i.id))
  }

  get selectedCount (): number {
    return this.selectedItems.length
  }

  get isSelecting (): boolean {
    return this.selectedCount > 0
  }
}
</script>

<style lang="scss" scoped>
.readonly-context-menu__selected {
  width: 190px;
}
</style>
