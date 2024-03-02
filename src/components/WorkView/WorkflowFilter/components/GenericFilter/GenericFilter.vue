<template>
  <generic-filter
    v-if="$can('view_full_datasets')"
    class="workflow-filter__generic"
    :loading="loading"
    :dataset="dataset"
    :filenames="allFilenames"
    :selected-positive-filenames="selectedPositiveFilenames"
    :selected-negative-filenames="selectedNegativeFilenames"
    :folders="folders"
    :selected-positive-folders="selectedPositiveFolders"
    :selected-negative-folders="selectedNegativeFolders"
    :members="members"
    :selected-positive-members="selectedPositiveMembers"
    :selected-negative-members="selectedNegativeMembers"
    :keyword.sync="searchKeyword"
    @change="updateFilter"
    @search="searchFilenames"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { filenameStringToFilenamePayload } from '@/components/DatasetFiltering/GenericFilter'
import { GenericFilter } from '@/components/DatasetFiltering/GenericFilter/V2'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetItemFilter,
  DatasetPayload,
  LoadingStatus,
  MembershipPayload,
  RootState
} from '@/store/types'

@Component({
  name: 'workflow-filter-generic-filter',
  components: { GenericFilter }
})
export default class WorkflowFilterGenericFilter extends Vue {
  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @Prop({ required: false, default: () => [] })
  positiveAssignees!: number[]

  @Prop({ required: false, default: () => [] })
  negativeAssignees!: number[]

  @Prop({ required: false, default: () => [] })
  positiveFilenames!: string[]

  @Prop({ required: false, default: () => [] })
  negativeFilenames!: string[]

  @Prop({ required: false, default: () => [] })
  positivePaths!: string[]

  @Prop({ required: false, default: () => [] })
  negativePaths!: string[]

  // assignee filter
  @Getter('relevantTeamMemberships', { namespace: 'team' })
  members!: MembershipPayload[]

  get selectedPositiveMembers (): MembershipPayload[] {
    return this.members.filter(m => this.positiveAssignees.includes(m.user_id))
  }

  get selectedNegativeMembers (): MembershipPayload[] {
    return this.members.filter(m => this.negativeAssignees.includes(m.user_id))
  }

  // folder filter
  @State((state: RootState) => state.workview.datasetFolders)
  folders!: DatasetFolderPayload[]

  @State((state: RootState) => state.loading.loadingStatus['workview/loadDatasetFolders'])
  foldersLoading!: LoadingStatus

  get selectedPositiveFolders (): DatasetFolderPayload[] {
    return this.folders.filter(
      (folder) => this.positivePaths.includes(folder.path)
    )
  }

  get selectedNegativeFolders (): DatasetFolderPayload[] {
    return this.folders.filter(
      (folder) => this.negativePaths.includes(folder.path)
    )
  }

  // filename filter related values
  @State((state: RootState) => state.workview.datasetItemFilenames)
  allFilenames!: DatasetItemFilenamePayload[]

  @State((state: RootState) => state.loading.loadingStatus['workview/searchFilenames'])
  filenamesLoading!: LoadingStatus

  get selectedPositiveFilenames (): DatasetItemFilenamePayload[] {
    return this.positiveFilenames.map((filename) => {
      const item = this.allFilenames.find(item => item.filename === filename)
      if (item) { return item }
      return filenameStringToFilenamePayload(filename)
    })
  }

  get selectedNegativeFilenames (): DatasetItemFilenamePayload[] {
    return this.negativeFilenames.map((filename) => {
      const item = this.allFilenames.find(item => item.filename === filename)
      if (item) { return item }
      return filenameStringToFilenamePayload(filename)
    })
  }

  get loading (): boolean {
    return this.foldersLoading === LoadingStatus.Loading ||
      this.filenamesLoading === LoadingStatus.Loading
  }

  @State(state => state.workview.datasetItemFilter)
  filter!: DatasetItemFilter

  searchKeyword: string = ''

  // Need to reload the filenames whenever the video id changes
  @Watch('filter.video_ids')
  onDatasetVideoId (): void { this.resetSearch() }

  // Need to reload the filenames whenever the path changes
  @Watch('filter.path')
  onPath (): void { this.resetSearch() }

  resetSearch (): void {
    this.searchKeyword = ''
    this.searchFilenames('')
  }

  searchFilenames (search: string): void {
    this.$store.dispatch('workview/searchFilenamesThrottled', { search })
  }

  updateFilter (updates:
    {
      positiveMembers: MembershipPayload[],
      negativeMembers: MembershipPayload[]
    } |
    {
      positiveFolders: DatasetFolderPayload[],
      negativeFolders: DatasetFolderPayload[]
    } |
    {
      positiveFilenames: DatasetItemFilenamePayload[],
      negativeFilenames: DatasetItemFilenamePayload[]
    }
  ): void {
    let newPositiveAssignees: number[] = this.positiveAssignees
    let newNegativeAssignees: number[] = this.negativeAssignees
    let newPositivePaths: string[] = this.positivePaths
    let newNegativePaths: string[] = this.negativePaths
    let newPositiveFilenames: string[] = this.positiveFilenames
    let newNegativeFilenames: string[] = this.negativeFilenames

    if ('positiveMembers' in updates) {
      newPositiveAssignees = updates.positiveMembers.map(m => m.user_id)
      newNegativeAssignees = updates.negativeMembers.map(m => m.user_id)
      this.$emit('update:positive-assignees', newPositiveAssignees)
      this.$emit('update:negative-assignees', newNegativeAssignees)
    }
    if ('positiveFolders' in updates) {
      newPositivePaths = updates.positiveFolders.map(f => f.path)
      newNegativePaths = updates.negativeFolders.map(f => f.path)
      this.$emit('update:positive-paths', newPositivePaths)
      this.$emit('update:negative-paths', newNegativePaths)
    }
    if ('positiveFilenames' in updates) {
      newPositiveFilenames = updates.positiveFilenames.map(f => f.filename)
      newNegativeFilenames = updates.negativeFilenames.map(f => f.filename)
      this.$emit('update:positive-filenames', newPositiveFilenames)
      this.$emit('update:negative-filenames', newNegativeFilenames)
    }

    this.$emit('change', {
      positiveAssignees: newPositiveAssignees,
      negativeAssignees: newNegativeAssignees,
      positiveFilenames: newPositiveFilenames,
      negativeFilenames: newNegativeFilenames,
      positiveFolders: newPositivePaths,
      negativeFolders: newNegativePaths
    })
  }
}
</script>

<style lang="scss" scoped>
.workflow-filter__generic {
  width: 100%;
  display: flex;

  :deep(.vs__dropdown-toggle) {
    height: auto;
  }

  :deep(.vs__dropdown-menu) {
    max-height: 200px;
  }
}
</style>
