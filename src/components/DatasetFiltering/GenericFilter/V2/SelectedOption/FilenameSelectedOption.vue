<template>
  <div class="filename-selected-option">
    <component
      :is="icon"
      class="filename-selected-option__icon"
    />
    <span class="filename-selected-option__name">{{ filename }}</span>
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
  IconDuotoneSmallImage,
  IconDuotoneSmallDcom,
  IconDuotoneSmallPdf,
  IconDuotoneSmallVideo
} from '@/assets/icons/V2/Duotone'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { DatasetItemFilenamePayload, DatasetItemType } from '@/store/types'

export default defineComponent({
  name: 'FilenameSelectedOption',
  components: {
    IconDuotoneSmallImage,
    IconDuotoneSmallDcom,
    IconDuotoneSmallPdf,
    IconDuotoneSmallVideo
  },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
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
      if (isDicom) { return 'icon-duotone-small-dcom' }
      if (isPdf) { return 'icon-duotone-small-pdf' }
      if ([DatasetItemType.playbackVideo, DatasetItemType.splitVideo].includes(type)) {
        return 'icon-duotone-small-video'
      }

      return 'icon-duotone-small-image'
    })

    return {
      filename,
      icon
    }
  }
})
</script>

<style lang="scss" scoped>
.filename-selected-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 2px;
  align-items: center;

  &__name {
    @include typography(md-1, inter, 500);
    @include ellipsis(1, md-1);
    overflow: hidden;
    color: $colorContentSecondary;
    text-align: left;
  }
}
</style>
