<template>
  <folder-popover
    :dataset="dataset"
    :loading="loading"
    :folders="folders"
    @move="$emit('set-folder', $event)"
  >
    <file-set-action-button>
      <folder-icon class="folder-icon" />
    </file-set-action-button>
  </folder-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { FolderIcon } from '@/assets/icons/V1'
import FolderPopover from '@/components/Common/FolderPopover.vue'
import { loadDatasetFolders } from '@/store/modules/dataset/actions/loadDatasetFolders'
import {
  DatasetFolderPayload,
  DatasetPayload,
  LoadingStatus,
  RootState,
  StoreActionPayload
} from '@/store/types'

import FileSetActionButton from './Common/FileSetActionButton.vue'

@Component({
  name: 'file-set-folder-button',
  components: {
    FileSetActionButton,
    FolderIcon,
    FolderPopover
  }
})
export default class FileSetFolderButton extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.datasetTreefiedFolders)
  folders!: DatasetFolderPayload[]

  @State((state: RootState) => state.loading.loadingStatus['dataset/loadDatasetFolders'])
  foldersLoading!: LoadingStatus

  get loading (): boolean {
    return this.foldersLoading !== LoadingStatus.Loaded
  }

  mounted (): void {
    const datasetId = this.dataset.id
    const payload: StoreActionPayload<typeof loadDatasetFolders> = { datasetId }
    this.$store.dispatch('dataset/loadDatasetFoldersThrottled', payload)
  }
}
</script>

<style lang="scss" scoped>
.folder-icon {
  color: $colorAliceNight;
}
</style>
