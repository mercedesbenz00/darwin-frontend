<template>
  <div class="folder-selected-option">
    <icon-duotone-small-folder class="folder-selected-option__icon" />
    <span class="folder-selected-option__name">{{ folderName }}</span>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { IconDuotoneSmallFolder } from '@/assets/icons/V2/Duotone'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { V2DatasetFolderPayload } from '@/store/types'

export default defineComponent({
  name: 'FolderSelectedOption',
  components: { IconDuotoneSmallFolder },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
    }
  },
  setup (props) {
    const folder: Ref<V2DatasetFolderPayload> = computed(() => {
      return props.option.data as V2DatasetFolderPayload
    })

    const folderName: Ref<string> = computed(() => {
      return folder.value.path
    })

    return {
      folderName
    }
  }
})
</script>

<style lang="scss" scoped>
.folder-selected-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 2px;
  align-items: center;

  &__icon {
    color: $colorAliceNight;
  }

  &__name {
    @include typography(md-1, inter, 500);
    @include ellipsis(1, md-1);
    overflow: hidden;
    color: $colorContentSecondary;
    text-align: left;
  }
}
</style>
