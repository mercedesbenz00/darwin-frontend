<template>
  <div class="filename-option">
    <component
      :is="icon"
      class="filename-option__icon"
    />
    <span class="filename-option__name">{{ filename }}</span>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import {
  IconDuotoneImage,
  IconDuotoneDcom,
  IconDuotonePdf,
  IconDuotoneVideo,
  IconDuotoneImageSelected,
  IconDuotoneDcomSelected,
  IconDuotonePdfSelected,
  IconDuotoneVideoSelected
} from '@/assets/icons/V2/Duotone'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { DatasetItemFilenamePayload, DatasetItemType } from '@/store/types'
import { TriToggleStatus } from '@/utils'

export default defineComponent({
  name: 'FilenameOption',
  components: {
    IconDuotoneImage,
    IconDuotoneDcom,
    IconDuotonePdf,
    IconDuotoneVideo,
    IconDuotoneImageSelected,
    IconDuotoneDcomSelected,
    IconDuotonePdfSelected,
    IconDuotoneVideoSelected
  },
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
    const item: Ref<DatasetItemFilenamePayload> = computed(() => {
      return props.option.data as DatasetItemFilenamePayload
    })

    const filename: Ref<string> = computed(() => {
      return item.value.filename
    })

    const icon: Ref<string> = computed(() => {
      const { isDicom, isPdf, type } = item.value
      const suffix = props.status === 'positive' ? '-selected' : ''

      if (isDicom) { return `icon-duotone-dcom${suffix}` }
      if (isPdf) { return `icon-duotone-pdf${suffix}` }
      if ([DatasetItemType.playbackVideo, DatasetItemType.splitVideo].includes(type)) {
        return `icon-duotone-video${suffix}`
      }

      return `icon-duotone-image${suffix}`
    })

    return {
      filename,
      icon
    }
  }
})
</script>

<style lang="scss" scoped>
.filename-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 5px;
  align-items: center;

  &__name {
    @include typography(md-1, inter, 500);
    color: $colorContentDefault;
    @include ellipsis(1, md-1);
    overflow: hidden;
    text-align: left;
  }
}
</style>
