<template>
  <gallery-context-menu-check-item
    class="select-all"
    :label="isAllSelected ? 'DESELECT ALL' : 'SELECT ALL'"
    :tooltip="allSelectedTooltip"
    :value="isAllSelected"
    @click="onSelectAll"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import GalleryContextMenuCheckItem from '@/components/Common/Gallery/GalleryContextMenuCheckItem.vue'
import { RootState } from '@/store/types'
import { onMacOS } from '@/utils'

@Component({
  name: 'select-all-context-menu-item',
  components: { GalleryContextMenuCheckItem }
})
export default class SelectAllContextMenuItem extends Vue {
  @State((state: RootState) => state.dataset.selectedAll)
  isAllSelected!: boolean

  get allSelectedTooltip (): string {
    const cmdKey = onMacOS() ? 'CMD' : 'CTRL'
    return this.isAllSelected
      ? '<span>Deselect <span class="tooltip__hotkey">Esc</span></span>'
      : `<span>Select all <span class="tooltip__hotkey">${cmdKey} + A</span></span>`
  }

  onSelectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', !this.isAllSelected)
  }
}
</script>

<style lang="scss" scoped>
.select-all {
  :deep(.check-box__label) {
    min-width: 100px;
  }
}
</style>
