<template>
  <div class="folder-structure">
    <div
      class="folder-structure__breadcrumbs"
      :class="{ 'folder-structure__breadcrumbs': showFolders }"
    >
      <breadcrumbs
        :current-path="currentPath"
        :dataset="dataset"
        :folders="folders"
      />
    </div>

    <v-popover
      v-if="showFolders"
      placement="right-start"
      popover-class="folder-structure__popover"
      trigger="click"
    >
      <icon-button
        class="folder-structure__button"
        color="transparent"
        size="mini"
        flair="super-soft"
      >
        <icon-duotone-view-folder />
      </icon-button>
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

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { IconButton } from '@/components/Common/Button/V2'
import FolderTree from '@/components/Common/FolderTree/FolderTree.vue'
import { Breadcrumbs } from '@/components/WorkView/WorkflowFilter'
import { DatasetFolderPayload, DatasetPayload, RootState } from '@/store/types'
import { parseRouteQueryToString } from '@/utils'

@Component({
  name: 'folder-structure',
  components: {
    Breadcrumbs,
    FolderTree,
    IconDuotoneViewFolder,
    IconButton
  }
})
export default class FolderStructure extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @State((state: RootState) => state.workview.datasetTreefiedFolders)
  folders!: DatasetFolderPayload[]

  get rootFolder (): DatasetFolderPayload {
    return this.folders[0]
  }

  get subFolders (): DatasetFolderPayload[] {
    const { rootFolder } = this
    if (!rootFolder) { return [] }
    return rootFolder.children || []
  }

  get showFolders (): boolean {
    return this.subFolders.length > 0
  }

  get currentPath (): string | undefined {
    return parseRouteQueryToString(this.$route.query.path)
  }

  onSelect (folder: DatasetFolderPayload): void {
    this.$router.push({
      path: '/workview',
      query: { ...this.$route.query, path: folder.path }
    })
  }
}
</script>

<style lang="scss" scoped>
.folder-structure {
  @include row--distributed;
  align-items: center;
  overflow: hidden;

  &__breadcrumbs {
    flex: 1;
    @include scrollbar;
    overflow-x: auto;
  }

  &__button {
    @include row--center;
    align-items: center;

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$popover-width: 260px;

.folder-structure__popover {
  width: $popover-width;
  background: $colorWhite;
  box-shadow: $dropShadowNeutral;
  border-radius: 10px;
  padding: 8px;

  .popover-inner {
    background: $colorWhite;
    padding: 0;
  }

  .popover-arrow {
    display: none;
  }
}
</style>
