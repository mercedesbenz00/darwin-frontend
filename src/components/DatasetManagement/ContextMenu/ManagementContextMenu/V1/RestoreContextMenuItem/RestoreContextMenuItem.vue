<template>
  <gallery-context-menu-item
    class="restore-context-menu-item"
    color="pink"
    :label="`RESTORE ${selectedItemCount}`"
    :disabled="!canArchive"
    @click="restoreItems"
  >
    <restore-icon />
  </gallery-context-menu-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { RestoreIcon } from '@/assets/icons/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { restoreDatasetItems } from '@/store/modules/dataset/actions/restoreDatasetItems'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { errorsByCode } from '@/utils'

@Component({
  name: 'restore-context-menu-item',
  components: {
    GalleryContextMenuItem,
    RestoreIcon
  }
})
export default class RestoreContextMenuItem extends Vue {
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

  async restoreItems (): Promise<void> {
    const { filter, canArchive, dataset } = this

    if (!canArchive) {
      const content = errorsByCode.DATASET_IMAGE_RESTORE_NOT_AUTHORIZED
      return this.$store.dispatch('toast/warning', { content })
    }

    const params: StoreActionPayload<typeof restoreDatasetItems> = {
      dataset,
      filter
    }

    const response = await this.$store.dispatch('dataset/restoreDatasetItems', params)

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
.restore-context-menu-item {
  color: $colorPink;
}
</style>
