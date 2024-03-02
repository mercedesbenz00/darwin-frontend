<template>
  <div class="folder-tree">
    <folder-tree-item
      v-for="folder of folders"
      :key="folder.path"
      class="folder-tree__item"
      :folder="folder"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { DatasetFolderPayload } from '@/store/types'

import FolderTreeItem from './FolderTreeItem.vue'

export default defineComponent({
  name: 'FolderTree',
  components: { FolderTreeItem },
  props: {
    folders: {
      required: true,
      type: Array as PropType<DatasetFolderPayload[]>
    }
  }
})
</script>

<style lang="scss" scoped>
.folder-tree {
  @include col;

  &__item {
    width: 100%;
    @include ellipsis(1, md-1);
  }
}
</style>
