<template>
  <generic-filter
    :loading="loading"
    :dataset="dataset"
    :filenames="allFilenames"
    :selected-positive-filenames="selectedPositiveFilenames"
    :selected-negative-filenames="selectedNegativeFilenames"
    :folders="allFolders"
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

import GenericFilter from '@/components/DatasetFiltering/GenericFilter/GenericFilter.vue'
import { filenameStringToFilenamePayload } from '@/components/DatasetFiltering/GenericFilter/utils'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetPayload,
  LoadingStatus,
  MembershipPayload,
  RootState
} from '@/store/types'

@Component({
  name: 'data-sidebar-generic-filter',
  components: { GenericFilter }
})
export default class DataSidebarGenericFilter extends Vue {
  @Prop({ required: true, type: Object })
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

  get selectedPositiveMembers () {
    return this.members.filter(m => this.positiveAssignees.includes(m.user_id))
  }

  get selectedNegativeMembers () {
    return this.members.filter(m => this.negativeAssignees.includes(m.user_id))
  }

  // folder filter
  @State((state: RootState) => state.dataset.folderEnabled)
  folderEnabled!: boolean

  @Getter('currentPathFolders', { namespace: 'dataset' })
  folders!: DatasetFolderPayload[]

  @State((state: RootState) => state.loading.loadingStatus['dataset/loadDatasetFolders'])
  foldersLoading!: LoadingStatus

  get allFolders () {
    return this.folderEnabled ? this.folders : []
  }

  get selectedPositiveFolders () {
    return this.folderEnabled
      ? this.folders.filter((folder) => this.positivePaths.includes(folder.path))
      : []
  }

  get selectedNegativeFolders () {
    return this.folderEnabled
      ? this.folders.filter((folder) => this.negativePaths.includes(folder.path))
      : []
  }

  // filename filter related values
  @State((state: RootState) => state.dataset.datasetItemFilenames)
  allFilenames!: DatasetItemFilenamePayload[]

  @State((state: RootState) => state.loading.loadingStatus['dataset/searchFilenames'])
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

  searchKeyword: string = ''

  get datasetVideoId (): string | undefined {
    return this.$route.params.datasetVideoId
  }

  get path (): string {
    const { path } = this.$route.params
    if (!path) { return '/' }
    return `/${path}`
  }

  // Need to reload the filenames whenever the video id changes
  @Watch('datasetVideoId')
  onDatasetVideoId () { this.resetSearch() }

  // Need to reload the filenames whenever the path changes
  @Watch('path')
  onPath () { this.resetSearch() }

  resetSearch () {
    this.searchKeyword = ''
    this.searchFilenames('')
  }

  get loading () {
    return this.foldersLoading === LoadingStatus.Loading ||
      this.filenamesLoading === LoadingStatus.Loading
  }

  searchFilenames (search: string) {
    this.$store.dispatch(
      'dataset/searchFilenamesThrottled',
      { search, datasetId: this.dataset.id }
    )
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
  ) {
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
