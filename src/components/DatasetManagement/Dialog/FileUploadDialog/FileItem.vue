<template>
  <div class="file-item">
    <div>
      <div class="file-item__title">
        <p class="title">
          {{ value.file.name }}
        </p>
        <span class="file-item__file-type file-type">{{ value.data.category }}</span>
      </div>

      <div class="file-item__metadata">
        {{ getFileSizeString(value.data.totalBytes) }}
      </div>
      <feature-guard feature="VOLUMES_V2">
        <toggle
          v-if="value.data.category === 'dicom'"
          :value="value.data.extractViews"
          @input="onExtractViewsChange"
        >
          Extract Views
        </toggle>
      </feature-guard>
    </div>
    <div class="file-item__footer">
      <template v-if="thumbnail">
        <div class="file-item__thumb">
          <img
            :src="thumbnail"
            alt=""
          >
        </div>
      </template>

      <icon-button
        @click="$emit('remove')"
        class="file-item__delete-btn"
        size="mini"
        color="transparent"
        flair="rounded"
      >
        <icon-mono-close />
      </icon-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { IconMonoClose } from '@/assets/icons/V2/Mono'
import { IconButton } from '@/components/Common/Button/V2'
import FeatureGuard from '@/components/Common/FeatureGuard.vue'
import Toggle from '@/components/Common/Toggle/V2/Toggle.vue'
import { getThumbnailFromFile } from '@/components/DatasetManagement/Dialog/FileUploadDialog/utils'
import { UploadFile } from '@/store/modules/datasetUpload/types'
import { getReadableFileSizeString } from '@/utils'

@Component({
  name: 'file-item',
  components: {
    FeatureGuard,
    IconMonoClose,
    IconButton,
    Toggle
  }
})
export default class FileItem extends Vue {
  @Prop({ type: Object })
  value!: UploadFile

  onExtractViewsChange (): void {
    this.$store.commit('datasetUpload/SET_FILE_DATA', {
      uploadFile: this.value,
      data: {
        extractViews: !this.value.data.extractViews
      }
    })
  }

  get isVersion2 (): boolean {
    return this.$store.getters['dataset/isVersion2']
  }

  get thumbnail (): string | ArrayBuffer {
    return getThumbnailFromFile(this.value)
  }

  getFileSizeString (sizeInBytes: number): string {
    return getReadableFileSizeString(sizeInBytes)
  }
}
</script>

<style lang="scss" scoped>
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $colorSurfaceDefault;
  border: 1px solid $colorStrokeStrong;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.06),
              0px 0px 1px rgba(0, 0, 0, 0.04),
              0px 2px 4px -1px rgba(49, 51, 53, 0.08);

  &__title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-right: 5px;
  }

  &__file-type {
    margin-left: 4px;
    font-size: 10px;
  }

  &__metadata {
    color: $colorContentSecondary;
    @include typography(md, inter, 500);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__thumb {
    position: relative;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    aspect-ratio: 8 / 5;

    img {
      position: absolute;
      width: 100%;
      min-height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &__delete-btn {
    margin-left: 10px;
  }
}

.title {
  @include typography(md-1, inter, 500);
  color: $colorContentEmphasis;
  width: max-content;
  max-width: 272px;
  word-break: break-word;
}

.file-type {
  @include typography(md, inter, 500);
  background-color: $colorSurfaceDarken;
  color: $colorContentSecondary;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
