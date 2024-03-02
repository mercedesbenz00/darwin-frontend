<template>
  <card
    class="item-card"
    :is-dicom="isDicom"
    :is-pdf="isPdf"
    :is-external="isExternal"
    :is-selected="isSelected"
    :priority="priority"
    :type="itemType"
    :thumbnail="thumbnailUrl"
    @select="setSelection"
  >
    <template #overlay-top-left>
      <check-box
        name="card-selected"
        :value="isSelected"
        @click.stop.prevent="$event => $emit('selected')"
      />
    </template>
    <template #overlay-top-right>
      <span>{{ dimensionInfo }}</span>
      <span>{{ filesizeInfo }}</span>
    </template>
    <template #overlay-center>
      <card-button
        v-if="isOpenable"
        :to="itemLocation"
      >
        Open
      </card-button>
      <card-button
        v-else-if="isRestorable"
        @click="onRestore"
      >
        Restore
      </card-button>
      <card-button
        v-else-if="hasError"
        @click="onArchive"
      >
        Archive
      </card-button>
    </template>
    <template #status>
      <status-icon
        class="item-card__status-icon"
        show-tooltip
        :item="data"
      />
    </template>
    <template #details>
      <dataset-item-name :name="originalFileName" />
      <div>
        <span>{{ date }}</span>
        <span>{{ seq }}</span>
      </div>
      <card-tags :tags="tags" />
    </template>
  </card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Card from '@/components/DatasetManagement/Card/V1/Card.vue'
import CardButton from '@/components/DatasetManagement/Card/V1/CardButton.vue'
import CardTags from '@/components/DatasetManagement/Common/CardTags/V1/CardTags.vue'
import DatasetItemName from '@/components/DatasetManagement/Common/DatasetItemName.vue'
import StatusIcon from '@/components/DatasetManagement/Status/V1/DatasetItemStatusIcon.vue'
import GalleryDatasetItem from '@/components/DatasetManagement/mixins/GalleryDatasetItem'

/**
 * Used to render dataset items in dataset management.
 *
 * Used when gallery is in card mode.
 */
@Component({
  name: 'dataset-item-card',
  components: { Card, CardButton, CardTags, CheckBox, DatasetItemName, StatusIcon },
  mixins: [GalleryDatasetItem]
})
export default class DatasetItemCard extends Vue {}
</script>

<style lang="scss" scoped>
.item-card__status-icon {
  width: 100%;
  height: 100%;

  &:hover.status-button--archived {
    background-color: $colorCrimsonLight;
  }
}
</style>
