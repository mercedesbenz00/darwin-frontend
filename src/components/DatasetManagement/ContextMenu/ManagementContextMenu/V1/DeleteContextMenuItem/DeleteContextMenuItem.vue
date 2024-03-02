<template>
  <gallery-context-menu-item
    class="delete-context-menu-item"
    color="pink"
    :label="`DELETE ${selectedItemCount}`"
    :disabled="!canDelete"
    @click="deleteSelectedItems"
  >
    <trash-icon-old class="delete-context-menu-item__icon" />
    <delete-confirmation-dialog
      :name="deleteModalName"
      :loading="deletingItems"
      title="Are you sure you wish to delete these images?"
      detail="This will permanently delete the selected images. It cannot be undone."
      @confirmed="deleteItems"
    />
  </gallery-context-menu-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrashIconOld } from '@/assets/icons/V1'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { deleteDatasetItems } from '@/store/modules/dataset/actions/deleteDatasetItems'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { errorsByCode } from '@/utils'

@Component({
  name: 'delete-context-menu-item',
  components: {
    DeleteConfirmationDialog,
    GalleryContextMenuItem,
    TrashIconOld
  }
})
export default class DeleteContextMenuItem extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => DatasetItemFilter })
  filter!: DatasetItemFilter

  @Prop({ required: true, type: Number })
  selectedItemCount!: number

  readonly deleteModalName = 'delete-items'

  deleteSelectedItems (): void {
    this.$modal.show(this.deleteModalName)
  }

  deletingItems: boolean = false

  async deleteItems (): Promise<void> {
    const { filter, canDelete, dataset } = this
    if (!canDelete) {
      const content = errorsByCode.DATASET_IMAGE_DELETE_NOT_AUTHORIZED
      return this.$store.dispatch('toast/warning', { content })
    }

    this.deletingItems = true

    const params: StoreActionPayload<typeof deleteDatasetItems> = {
      dataset,
      filter
    }
    const response = await this.$store.dispatch('dataset/deleteDatasetItems', params)

    this.deletingItems = false

    if ('error' in response) {
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    this.$modal.hide(this.deleteModalName)

    this.deselectAll()
  }

  get canDelete (): boolean {
    const { dataset } = this

    return this.$can(
      'delete_dataset_items',
      { subject: 'dataset', resource: dataset },
      ['member', 'workforce_manager', 'admin', 'owner']
    )
  }

  deselectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  }
}
</script>

<style lang="scss" scoped>
.delete-context-menu-item__icon {
  color: $colorCrimsonLight;
}
</style>
