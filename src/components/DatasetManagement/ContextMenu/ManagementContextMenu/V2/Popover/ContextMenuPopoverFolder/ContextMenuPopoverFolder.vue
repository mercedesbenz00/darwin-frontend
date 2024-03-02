<template>
  <popover
    :show="show"
    placeholder="/enter folder or path"
    @on-input="(val) => (searchValue = val)"
    :input-value="searchValue"
    @enter="onActionFolder"
  >
    <template #right-icon>
      <fade-transition>
        <icon-button
          v-if="filteredFolders.length===0"
          size="mini"
          flair="super-soft"
          @click.prevent.stop="onFolderCreate"
        >
          <icon-duotone-add-folder />
        </icon-button>
      </fade-transition>
    </template>
    <list-header
      size="medium"
      label="Move Files to ..."
      disabled
    />
    <div
      class="popover-tree__wrapper"
      v-if="searchValue.length === 0"
    >
      <folder-tree
        v-for="(folder, index) in treefiedFolders"
        :key="index"
        :sub-folder="folder"
        :tree-level="treeLevel"
        @click="(f) => $emit('set-folder', f)"
      />
    </div>
    <div
      class="popover-tree__wrapper"
      v-else
    >
      <list-element-v2
        v-for="(folder, index) in filteredFolders"
        :key="index"
        :text="folder.path"
      >
        <template #prefix>
          <icon-duotone-view-folder />
        </template>
      </list-element-v2>
    </div>
  </popover>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconDuotoneAddFolder, IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { IconButton } from '@/components/Common/Button/V2'
import ListHeader from '@/components/Common/Headers/ListHeader/ListHeader.vue'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import FolderTree from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/ContextMenuPopoverFolder/FolderTree/FolderTree.vue'
import Popover from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/Popover.vue'
import FadeTransition from '@/components/Transitions/Fade.vue'
import { V2DatasetFolderPayload, RootState } from '@/store/types'
import { normalizeFolderPath } from '@/utils'

/**
 * @Component ContextMenuPopoverFolder
 * ~ Component will emit two functions. Either the component will return an optimized path on input
 * or it will return the DatatsetFolderPayload object onClick
 * @param {string} type
 * @param {string} show
 * */

@Component({
  name: 'context-menu-popover-folder',
  components: {
    Popover,
    ListHeader,
    FolderTree,
    IconButton,
    IconDuotoneAddFolder,
    IconDuotoneViewFolder,
    FadeTransition,
    ListElementV2
  }
})
export default class ContextMenuPopoverFolder extends Vue {
  searchValue: string = ''
  treeLevel: number = 0

  @Prop({ type: Boolean, default: false })
  show!: boolean

  @State((state: RootState) => state.dataset.datasetTreefiedFoldersV2)
  treefiedFolders!: V2DatasetFolderPayload[]

  @State((state: RootState) => state.dataset.datasetFoldersV2)
  folders!: V2DatasetFolderPayload[]

  get filteredFolders (): V2DatasetFolderPayload[] {
    return this.folders.filter(f => f.path.match(new RegExp(this.searchValue, 'i')))
  }

  onFolderCreate (): void {
    // Error will be handled outside of this component. I think we use a toast for that
    this.$emit('create-folder', normalizeFolderPath(this.searchValue))
  }

  onActionFolder (): void {
    if (this.filteredFolders.length) {
      this.$emit('set-folder', this.filteredFolders[0])
    } else {
      this.$emit('create-folder', normalizeFolderPath(this.searchValue))
    }
  }
}
</script>

<style lang="scss" scoped>
.popover-tree__wrapper {
  display: block;
  padding: 0 4px 4px 4px;
}
</style>
