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
import { computed, defineComponent } from 'vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { IconButton } from '@/components/Common/Button/V2'
import FolderTree from '@/components/Common/FolderTree/FolderTree.vue'
import { Breadcrumbs } from '@/components/WorkView/WorkflowFilter'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { DatasetFolderPayload, DatasetPayload } from '@/store/types'
import { parseRouteQueryToString } from '@/utils'

export default defineComponent({
  name: 'FolderStructure',
  components: {
    Breadcrumbs,
    FolderTree,
    IconDuotoneViewFolder,
    IconButton
  },
  props: {
    dataset: { required: true, type: Object as () => DatasetPayload }
  },
  setup () {
    const { state } = useStore()
    const route = useRoute()
    const router = useRouter()

    const folders = computed(() => state.dataset.datasetTreefiedFoldersV2)

    const rootFolder = computed(() => folders.value[0])

    const subFolders = computed(() => {
      if (!rootFolder.value) { return [] }
      return rootFolder.value.children || []
    })

    const showFolders = computed((): boolean => {
      return state.dataset.folderEnabled && subFolders.value.length > 0
    })

    const currentPath = computed((): string | undefined => {
      return parseRouteQueryToString(route.query.path)
    })

    const onSelect = (folder: DatasetFolderPayload): void => {
      router.push({
        path: '/workview',
        query: { ...route.query, path: folder.path }
      })
    }

    return {
      folders,
      subFolders,
      showFolders,
      currentPath,
      onSelect
    }
  }
})
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
