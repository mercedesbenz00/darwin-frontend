<template>
  <div class="folder-display">
    <div class="folder-display__folders">
      <workflow-folder-crumbs
        :current-path="currentPath"
        :dataset="dataset"
        :folders="folders"
      />
    </div>

    <v-popover
      v-if="subFolders.length > 0"
      placement="right-start"
      popover-class="folder-display__popover"
      trigger="click"
    >
      <button class="folder-display__button">
        <folder-icon />
      </button>
      <template #popover>
        <folder-tree
          :folders="subFolders"
          @select="onSelect"
        />
      </template>
    </v-popover>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { FolderIcon } from '@/assets/icons/V1'
import FolderTree from '@/components/Common/FolderTree/FolderTree.vue'
import { DatasetFolderPayload, DatasetPayload, RootState } from '@/store/types'
import { parseRouteQueryToString } from '@/utils'

import WorkflowFolderCrumbs from './WorkflowFolderCrumbs.vue'

@Component({
  name: 'workflow-folder-display',
  components: { FolderIcon, FolderTree, WorkflowFolderCrumbs }
})
export default class WorkflowFolderDisplay extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @State((state: RootState) => state.workview.datasetTreefiedFolders)
  folders!: DatasetFolderPayload[]

  get rootFolder () {
    return this.folders[0]
  }

  get subFolders () {
    const { rootFolder } = this
    if (!rootFolder) { return [] }
    return rootFolder.children
  }

  get currentPath (): string | undefined {
    return parseRouteQueryToString(this.$route.query.path)
  }

  onSelect (folder: DatasetFolderPayload) {
    this.$router.push({
      path: '/workview',
      query: {
        ...this.$route.query,
        path: folder.path
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.folder-display {
  @include row;
  align-items: center;
  overflow: hidden;
}

.folder-display__folders {
  flex: 1;
  overflow-x: auto;
  @include scrollbar;
}

.folder-display__button {
  width: 24px;
  height: 24px;
  @include row--center;
  border-radius: 50%;
  outline: none;
  background: transparent;
  color: $colorAliceNight;
  padding: 7px;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    background: $colorAliceShade;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$popover-width: 260px;

.folder-display__popover {
  width: $popover-width;
  background: $colorWhite;
  box-shadow: 0px 15px 30px rgba(145, 169, 192, 0.5);
  border-radius: 2px 2px 0px 0px;

  .popover-inner {
    background: white;
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
