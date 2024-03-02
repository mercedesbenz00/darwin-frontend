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
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DicomIcon, ImageIcon, PdfIcon, VideoIcon } from '@/assets/icons/V1/generic-filter'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { DatasetItemFilenamePayload, DatasetItemType } from '@/store/types'

@Component({
  name: 'filename-option',
  components: { DicomIcon, ImageIcon, PdfIcon, VideoIcon }
})
export default class FilenameOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  get item (): DatasetItemFilenamePayload {
    return this.option.data as DatasetItemFilenamePayload
  }

  get filename (): string {
    return this.item.filename
  }

  get icon (): 'dicom-icon' | 'image-icon' | 'pdf-icon' | 'video-icon' {
    const { isDicom, isPdf, type } = this.item
    if (isDicom) { return 'dicom-icon' }
    if (isPdf) { return 'pdf-icon' }
    if ([DatasetItemType.playbackVideo, DatasetItemType.splitVideo].includes(type)) {
      return 'video-icon'
    }

    return 'image-icon'
  }
}
</script>

<style lang="scss" scoped>
.filename-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 5px;
  align-items: center;

  &__name {
    @include typography(md, mulish);
    @include ellipsis(1, md);
    overflow: hidden;
    color: $color90Black;
    text-align: left;
  }
}
</style>
