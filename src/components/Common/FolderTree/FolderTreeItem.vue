<template>
  <div class="folder-tree__item">
    <div
      v-close-popover
      class="folder-tree__item__info"
      @click="onSelect(folder)"
    >
      <folder-icon class="folder-tree__item__icon" />
      <label
        v-tooltip="tooltip"
        class="folder-tree__item__name"
      >
        {{ name }}
      </label>
    </div>
    <div
      v-if="showChildren"
      class="folder-tree__item__sub-folders"
    >
      <folder-tree
        :folders="children"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import { DatasetFolderPayload, V2DatasetFolderPayload } from '@/store/types'
import { TooltipOptions } from '@/types'
import { getFolderName } from '@/utils'

@Component({
  name: 'folder-tree-item',
  components: { FolderIcon }
})
export default class FolderTreeItem extends Vue {
  @Prop({ required: true })
  folder!: DatasetFolderPayload

  get children (): DatasetFolderPayload[] | V2DatasetFolderPayload[] | undefined {
    return this.folder.children
  }

  get showChildren (): boolean | undefined {
    return this.children && this.children.length > 0
  }

  get name (): string {
    return getFolderName(this.folder.path)
  }

  get showTooltip (): boolean {
    return this.name.length > 36
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.showTooltip ? this.name : '',
      placement: 'top',
      delay: { show: 300, hide: 300 }
    }
  }

  beforeCreate (): void {
    // Include the folder tree component in a recursive way
    this.$options.components!.FolderTree = require('./FolderTree.vue').default
  }

  onSelect (folder: DatasetFolderPayload | V2DatasetFolderPayload): void {
    this.$emit('select', folder)
  }
}
</script>

<style lang="scss" scoped>
.folder-tree__item {
  @include col;
  flex: 0;

  &__info {
    @include row;
    align-items: center;
    height: 25px;
    cursor: pointer;

    &:hover {
      background: $colorAliceBlue;
    }

    &:active {
      background: $colorAliceShade;
    }
  }

  &__icon {
    width: 14px;
    min-width: 14px;
    margin: 0 8px;
    color: $colorContentSecondary;
  }

  &__name {
    width: 100%;
    max-width: 100%;
    @include ellipsis(1, md);
    @include typography(md, inter, 500);
    color: $colorContentDefault;
    cursor: pointer;
  }

  &__sub-folders {
    @include col;
    border-left: 1px solid $colorContentTertiary;
    margin-left: 12px;
  }
}
</style>
