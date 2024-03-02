<template>
  <div class="folder-option">
    <icon-duotone-view-folder :variant="variant" />
    <span class="folder-option__name">{{ folderName }}</span>
    <span class="folder-option__count">{{ count }}</span>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import { IconDuotoneViewFolder } from '@/assets/icons/V2/Duotone'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { V2DatasetFolderPayload } from '@/store/types'
import { TriToggleStatus } from '@/utils'

export default defineComponent({
  name: 'FolderOption',
  components: { IconDuotoneViewFolder },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
    },
    status: {
      required: false,
      type: String as () => TriToggleStatus,
      default: 'none'
    }
  },
  setup (props) {
    const folder: Ref<V2DatasetFolderPayload> = computed(() => {
      return props.option.data as V2DatasetFolderPayload
    })

    const folderName: Ref<string> = computed(() => {
      return props.option.label
    })

    const count: Ref<number> = computed(() => {
      return folder.value.filtered_item_count
    })

    const variant: Ref<string> = computed(() => {
      if (props.status === 'positive') {
        return 'selected'
      } else {
        return 'default'
      }
    })

    return {
      folderName,
      count,
      variant
    }
  }
})
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
    @include typography(md-1, inter, 500);
    color: $colorContentDefault;
    @include ellipsis(1, md-1);
    overflow: hidden;
    text-align: left;
  }

  &__count {
    @include typography(md, inter, 500);
    color: $colorContentTertiary;
  }
}
</style>
