<template>
  <list-item
    class="folder-list-item"
    type="folder"
    :name="name"
  >
    <template #overlay>
      <list-item-button :to="folderLocation">
        Open
      </list-item-button>
    </template>
  </list-item>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ListItem from '@/components/DatasetManagement/ListItem/ListItem.vue'
import ListItemButton from '@/components/DatasetManagement/ListItem/ListItemButton.vue'
import GalleryDatasetFolder from '@/components/DatasetManagement/mixins/GalleryDatasetFolder'

/**
 * Used to render folders in dataset management and open datasets.
 *
 * Used when the gallery is in list view mode.
 */
@Component({
  name: 'dataset-folder-list-item',
  components: { ListItem, ListItemButton },
  mixins: [GalleryDatasetFolder]
})
export default class DatasetFolderListItem extends Vue {}
</script>

<style lang="scss" scoped>
@import "ListItemHeader/workflow-list-item";

.list-item {
  @include workflow-list-item;
}

.status-icon-container {
  width: 20px;
  height: 20px;
}
</style>
