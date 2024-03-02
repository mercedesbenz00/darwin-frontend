<template>
  <folder-popover
    :dataset="dataset"
    :folders="folders"
    :loading="loading"
    :disabled="isVideoPage"
    @move="moveToFolder"
  >
    <gallery-context-menu-item
      class="new-folder-context-menu-item"
      label="FOLDER"
      @click="onClick"
    >
      <folder-icon class="new-folder__icon" />
    </gallery-context-menu-item>
  </folder-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { FolderIcon } from '@/assets/icons/V1'
import FolderPopover from '@/components/Common/FolderPopover.vue'
import GalleryContextMenuItem from '@/components/Common/Gallery/GalleryContextMenuItem.vue'
import { moveItemsToPath } from '@/store/modules/dataset/actions/moveItemsToPath'
import {
  DatasetFolderPayload,
  DatasetItemFilter,
  DatasetPayload,
  LoadingStatus,
  RootState,
  StoreActionPayload
} from '@/store/types'
import { errorsByCode } from '@/utils'

@Component({
  name: 'new-folder-context-menu-item',
  components: { FolderIcon, FolderPopover, GalleryContextMenuItem }
})
export default class NewFolderContextMenuItem extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => DatasetItemFilter })
  filter!: DatasetItemFilter

  @State((state: RootState) => state.dataset.datasetTreefiedFolders)
  folders!: DatasetFolderPayload[]

  @State((state: RootState) => state.loading.loadingStatus['dataset/loadDatasetFolders'])
  foldersLoading!: LoadingStatus

  get isVideoPage (): boolean {
    return this.$route.name === 'DatasetManagementVideo'
  }

  get loading (): boolean {
    return this.foldersLoading !== LoadingStatus.Loaded
  }

  onClick (): void {
    if (!this.isVideoPage) { return }
    this.$store.dispatch('toast/warning', {
      content: errorsByCode.WORKFLOW_CANNOT_MOVE_VIDEO_TO_FOLDER
    })
  }

  async moveToFolder (path: string): Promise<void> {
    const { filter, dataset } = this
    if (!path) { return }

    const params: StoreActionPayload<typeof moveItemsToPath> = {
      dataset,
      filter,
      path
    }
    const { error } = await this.$store.dispatch('dataset/moveItemsToPath', params)
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }

    this.$store.dispatch('toast/notify', { content: 'Items successfully moved!' })

    this.deselectAll()
  }

  deselectAll (): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  }
}
</script>

<style lang="scss" scoped>
.new-folder-context-menu-item {
  height: 100%;
}

.new-folder__icon {
  color: $colorAliceNight;
}
</style>
