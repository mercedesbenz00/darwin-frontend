<template>
  <gallery-context-menu-item
    class="archive-context-menu-item"
    color="pink"
    :label="`ARCHIVE ${selectedItemCount}`"
    :disabled="!canArchive"
    @click="archiveItems"
  >
    <trash-icon-old class="archive-context-menu-item__icon" />
  </gallery-context-menu-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrashIconOld } from '@/assets/icons/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { archiveDatasetItems } from '@/store/modules/dataset/actions/archiveDatasetItems'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { errorsByCode } from '@/utils'

@Component({
  name: 'archive-context-menu-item',
  components: {
    GalleryContextMenuItem,
    TrashIconOld
  }
})
export default class ArchiveContextMenuItem extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => DatasetItemFilter })
  filter!: DatasetItemFilter

  @Prop({ required: true, type: Number })
  selectedItemCount!: number

  /**
   * Checks by provided ability first, then by user role
   *
   * More accurate check would be to explictly see if workforce manager is
   * annotator in dataset.
   */
  get canArchive (): boolean {
    const { dataset } = this

    return this.$can(
      'archive_dataset_items',
      { subject: 'dataset', resource: dataset },
      ['member', 'workforce_manager', 'admin', 'owner']
    )
  }

  async archiveItems (): Promise<void> {
    const { filter, canArchive, dataset } = this
    if (!canArchive) {
      const content = errorsByCode.DATASET_IMAGE_DELETE_NOT_AUTHORIZED
      return this.$store.dispatch('toast/warning', { content })
    }

    const params: StoreActionPayload<typeof archiveDatasetItems> = {
      dataset: dataset,
      filter
    }

    const response = await this.$store.dispatch('dataset/archiveDatasetItems', params)

    if ('error' in response) {
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    this.deselectAll()
  }

  deselectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  }
}
</script>

<style lang="scss" scoped>
.archive-context-menu-item__icon {
  color: $colorCrimsonLight;
}
</style>
