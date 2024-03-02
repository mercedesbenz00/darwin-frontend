<template>
  <div class="folder-selected-option">
    <folder-icon class="folder-selected-option__icon" />
    <span class="folder-selected-option__name">{{ folderName }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { DatasetFolderPayload } from '@/store/types'

@Component({
  name: 'folder-selected-option',
  components: { FolderIcon }
})
export default class FolderSelectedOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  get folder (): DatasetFolderPayload {
    return this.option.data as DatasetFolderPayload
  }

  get folderName (): string {
    return this.folder.path
  }
}
</script>

<style lang="scss" scoped>
.folder-selected-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 5px;
  align-items: center;

  &__icon {
    color: $colorAliceNight;
  }

  &__name {
    @include typography(md, mulish);
    @include ellipsis(1, md);
    overflow: hidden;
    color: $color90Black;
    text-align: left;
  }
}
</style>
