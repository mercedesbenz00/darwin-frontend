<template>
  <gallery-context-menu
    v-if="selectedItemCount > 0"
    class="management-context-menu"
  >
    <select-all-context-menu-item />
    <restore-context-menu-item
      v-if="allSelectedItemsArchived"
      :dataset="dataset"
      :filter="actionFilter"
      :selected-item-count="selectedItemCount"
    />
    <delete-context-menu-item
      v-if="allSelectedItemsArchived"
      :dataset="dataset"
      :filter="actionFilter"
      :selected-item-count="selectedItemCount"
    />
    <archive-context-menu-item
      v-if="!allSelectedItemsArchived"
      :dataset="dataset"
      :filter="actionFilter"
      :selected-item-count="selectedItemCount"
    />
    <assign-items-context-menu-item
      v-if="!allSelectedItemsArchived"
      :dataset="dataset"
      :filter="actionFilter"
    />
    <status-context-menu-item />
    <new-folder-context-menu-item
      :dataset="dataset"
      :filter="actionFilter"
    />
    <priority-context-menu-item
      :dataset="dataset"
      :filter="actionFilter"
    />
  </gallery-context-menu>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import GalleryContextMenu from '@/components/Common/Gallery/GalleryContextMenu.vue'
import {
  DatasetDetailPayload,
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetPayload,
  RootState
} from '@/store/types'

import ArchiveContextMenuItem from './ArchiveContextMenuItem/ArchiveContextMenuItem.vue'
import AssignItemsContextMenuItem from './AssignItemsContextMenuItem/AssignItemsContextMenuItem.vue'
import DeleteContextMenuItem from './DeleteContextMenuItem/DeleteContextMenuItem.vue'
import NewFolderContextMenuItem from './NewFolderContextMenuItem/NewFolderContextMenuItem.vue'
import PriorityContextMenuItem from './PriorityContextMenuItem/PriorityContextMenuItem.vue'
import RestoreContextMenuItem from './RestoreContextMenuItem/RestoreContextMenuItem.vue'
import SelectAllContextMenuItem from './SelectAllContextMenuItem/SelectAllContextMenuItem.vue'
import StatusContextMenuItem from './StatusContextMenuItem/StatusContextMenuItem.vue'

/**
 * Renders a context menu in dataset management data tabs (base and video).
 *
 * Handles actions on selected items.
 */
@Component({
  name: 'workflow-management-context-menu',
  components: {
    ArchiveContextMenuItem,
    AssignItemsContextMenuItem,
    DeleteContextMenuItem,
    GalleryContextMenu,
    NewFolderContextMenuItem,
    PriorityContextMenuItem,
    RestoreContextMenuItem,
    SelectAllContextMenuItem,
    StatusContextMenuItem
  }
})
export default class ManagementContextMenu extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State((state: RootState) => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  @State((state: RootState) => state.dataset.datasetItemFilter)
  filter!: DatasetItemFilter

  @State((state: RootState) => state.dataset.selectedAll)
  isAllSelected!: boolean

  @State((state: RootState) => state.dataset.datasetDetails)
  details!: DatasetDetailPayload[]

  @Getter('managementActionFilter', { namespace: 'dataset' })
  actionFilter!: DatasetItemFilter

  /**
   * Determines if it's safe to use "delete all" within the current selection.
   * We need to be careful with this, since it has potential to delete all items
   * in the dataset, so we only allow deletion in one of two cases
   *
   * 1. Individual selection and all selected items are archived
   * 2. "Select All", all items loaded and all items are archived
   * 3. "Select All", not all items loaded, but filter would only list archived items.
   */
  @Getter('allSelectedItemsArchived', { namespace: 'dataset' })
  allSelectedItemsArchived!: boolean

  @Getter('selectedItemCount', { namespace: 'dataset' })
  selectedItemCount!: number
}
</script>

<style lang="scss" scoped>
.management-context-menu {
  width: 95%;
  grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr 1fr;
  // required so pop-over selection elements on individual items are rendered
  overflow: visible;
}
</style>
