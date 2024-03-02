<template>
  <div class="folder-option">
    <folder-icon class="folder-option__icon" />
    <span class="folder-option__name">{{ folderName }}</span>
    <span class="folder-option__count">{{ count }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { DatasetFolderPayload } from '@/store/types'

@Component({
  name: 'folder-option',
  components: { FolderIcon }
})
export default class FolderOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  get folder (): DatasetFolderPayload {
    return this.option.data as DatasetFolderPayload
  }

  get folderName (): string {
    return this.option.label
  }

  get count (): number {
    return this.folder.direct_item_count
  }
}
</script>

<style lang="scss" scoped>
.folder-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
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

  &__count {
    @include typography(sm, mulish);
    color: $colorAliceNight;
  }
}
</style>
