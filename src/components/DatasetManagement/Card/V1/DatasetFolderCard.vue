<template>
  <card
    class="folder-card"
    type="folder"
    :thumbnail="thumbnail"
  >
    <template #overlay-center>
      <card-button :to="folderLocation">
        Open
      </card-button>
    </template>
    <template #details>
      <div>{{ folderName }}</div>
      <div>{{ count }} items</div>
    </template>
  </card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Card from '@/components/DatasetManagement/Card/V1/Card.vue'
import CardButton from '@/components/DatasetManagement/Card/V1/CardButton.vue'
import GalleryDatasetFolder from '@/components/DatasetManagement/mixins/GalleryDatasetFolder'

/**
 * Used to render folders in dataset management and open datasets.
 *
 * Used when the gallery is in card mode.
 */
@Component({
  name: 'dataset-folder-card',
  components: { Card, CardButton },
  mixins: [GalleryDatasetFolder]
})
export default class DatasetFolderCard extends Vue {}
</script>
