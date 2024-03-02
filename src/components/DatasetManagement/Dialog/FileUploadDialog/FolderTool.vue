<template>
  <folder-popover
    class="tool"
    :dataset="dataset"
    :loading="loading"
    :folders="folderOptions"
    v-tooltip="'Move to folder'"
    @move="onSetFolder"
  >
    <div class="tool__content">
      <icon-duotone-view-folder />
      <span
        v-if="path"
        class="tool__text"
      >
        {{ path }}
      </span>
    </div>
  </folder-popover>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import FolderPopover from '@/components/Common/FolderPopover.vue'
import {
  loadDatasetFolders
} from '@/store/modules/dataset/actions/loadDatasetFolders'
import {
  loadV2DatasetFolders
} from '@/store/modules/dataset/actions/loadV2DatasetFolders'
import {
  Dataset,
  DatasetFolderPayload,
  DatasetPayload,
  LoadingStatus,
  RootState,
  StoreActionPayload,
  TeamPayload,
  V2DatasetFolderPayload
} from '@/store/types'

@Component({
  name: 'folder-tool',
  components: {
    IconDuotoneViewFolder,
    FolderPopover
  }
})
export default class FolderTool extends Vue {
  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @State((state: RootState) => state.dataset.datasetTreefiedFolders)
  folders!: DatasetFolderPayload[]

  @State((state: RootState) => state.dataset.datasetTreefiedFoldersV2)
  foldersV2!: V2DatasetFolderPayload[]

  @State((state: RootState) => state.loading.loadingStatus['dataset/loadDatasetFolders'])
  foldersLoading!: LoadingStatus

  @State((state: RootState) => state.loading.loadingStatus['dataset/loadV2DatasetFolders'])
  foldersLoadingV2!: LoadingStatus

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  mounted (): void {
    if (!this.dataset || !this.currentTeam) { return }
    const datasetId = this.dataset.id
    if (this.dataset.version === 2) {
      const payload: StoreActionPayload<typeof loadV2DatasetFolders> = {
        datasetId,
        teamSlug: this.currentTeam.slug
      }
      this.$store.dispatch('dataset/loadV2DatasetFoldersThrottled', payload)
    } else {
      const payload: StoreActionPayload<typeof loadDatasetFolders> = { datasetId }
      this.$store.dispatch('dataset/loadDatasetFoldersThrottled', payload)
    }
  }

  get dataset (): DatasetPayload | null {
    if (!this.currentDataset.id) { return null }
    return this.datasetById(this.currentDataset.id)
  }

  get path (): string | null {
    return this.$store.state.datasetUpload.path || null
  }

  get loading (): boolean {
    if (this.dataset?.version === 2) {
      return this.foldersLoadingV2 !== LoadingStatus.Loaded
    }
    return this.foldersLoading !== LoadingStatus.Loaded
  }

  get folderOptions (): DatasetFolderPayload[] | V2DatasetFolderPayload[] {
    if (this.dataset && this.dataset.version === 2) {
      return this.foldersV2
    }
    return this.folders
  }

  public onSetFolder (path: string): void {
    this.$store.commit('datasetUpload/SET_COMMON_PATH', path)
  }
}
</script>

<style lang="scss" scoped>
.tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $colorContentSecondary;
  font-size: 13px;
  padding: 0 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background .3s;

  &:hover, &.open {
    background: $colorInteractiveSecondaryPressed;
  }

  &__content {
    display: flex;
    align-items: center;
  }

  &__text {
    margin-left: 5px;
  }
}
</style>
