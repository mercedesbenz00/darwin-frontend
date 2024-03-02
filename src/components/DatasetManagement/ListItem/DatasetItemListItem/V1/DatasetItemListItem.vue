<template>
  <list-item
    class="list-item"
    :date="data.inserted_at"
    :is-selected="isSelected"
    :name="originalFileName"
    :thumbnail="thumbnailUrl"
    :type="itemType"
    @select="setSelection"
  >
    <template #overlay>
      <list-item-button
        v-if="isOpenable"
        :to="itemLocation"
      >
        Open
      </list-item-button>
      <list-item-button
        v-else-if="isRestorable"
        @click="onRestore"
      >
        Restore
      </list-item-button>
      <list-item-button
        v-else-if="hasError"
        @click="onArchive"
      >
        Archive
      </list-item-button>
    </template>
    <template #status>
      <div class="status-icon-container">
        <status-icon :item="data" />
      </div>
      <status
        :status="data.status"
        outline
      />
    </template>
    <template #details>
      <div class="list-item__modified_at">
        {{ modifiedAt }}
      </div>
      <div class="list-item__labels">
        <card-tags :tags="tags" />
      </div>
      <div class="list-item__image_dimension">
        {{ dimensionInfo }}
      </div>
      <div class="list-item__file_size">
        {{ filesizeInfo }}
      </div>
    </template>
  </list-item>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import CardTags from '@/components/DatasetManagement/Common/CardTags/V1/CardTags.vue'
import ListItem from '@/components/DatasetManagement/ListItem/ListItem.vue'
import ListItemButton from '@/components/DatasetManagement/ListItem/ListItemButton.vue'
import Status from '@/components/DatasetManagement/Status/DatasetItemStatus.vue'
import StatusIcon from '@/components/DatasetManagement/Status/V1/DatasetItemStatusIcon.vue'
import GalleryDatasetItem from '@/components/DatasetManagement/mixins/GalleryDatasetItem'

/**
 * Used to render images in dataset management and open datasets.
 *
 * Used when the gallery is in list view mode.
 */
@Component({
  name: 'dataset-item-list-item',
  components: { CardTags, ListItem, ListItemButton, Status, StatusIcon },
  mixins: [GalleryDatasetItem]
})
export default class DatasetItemListItem extends Vue {}
</script>

<style lang="scss" scoped>
@import "../../ListItemHeader/workflow-list-item";

.list-item {
  @include workflow-list-item;
}

.status-icon-container {
  width: 20px;
  height: 20px;
  min-width: 20px;
}
</style>
