<template>
  <div class="file-set">
    <file-set-delete-button @click="$emit('remove-set')" />
    <file-set-thumbnails :thumbnails="thumbnails" />
    <file-set-info :set="set">
      <template #actions>
        <file-set-tag-button
          v-if="!hideTags"
          :dataset="dataset"
          :tags="tags"
          @set-tags="$emit('set-tags', $event)"
        />
        <file-set-folder-button
          v-if="!hideFolder"
          :dataset="dataset"
          @set-folder="$emit('set-folder', $event)"
        />
      </template>
    </file-set-info>
    <file-set-current-folder
      v-if="!hideFolder"
      :set="set"
    />
    <file-set-current-tags
      v-if="!hideTags"
      :dataset="dataset"
      :tags="tags"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { UploadFileSet } from '@/components/Dataset/DropZone/types'
import { UploadFile } from '@/store/modules/datasetUpload/types'
import { DatasetPayload } from '@/store/types'

import FileSetCurrentFolder from './FileSetCurrentFolder.vue'
import FileSetCurrentTags from './FileSetCurrentTags.vue'
import FileSetDeleteButton from './FileSetDeleteButton.vue'
import FileSetFolderButton from './FileSetFolderButton.vue'
import FileSetInfo from './FileSetInfo.vue'
import FileSetTagButton from './FileSetTagButton.vue'
import FileSetThumbnails from './FileSetThumbnails.vue'
import { FilesByCategory, THUMB_LIMIT } from './types'
import { getThumbnailFromFiles } from './utils'

@Component({
  name: 'file-set',
  components: {
    FileSetCurrentFolder,
    FileSetCurrentTags,
    FileSetDeleteButton,
    FileSetFolderButton,
    FileSetInfo,
    FileSetTagButton,
    FileSetThumbnails
  }
})
export default class FileSet extends Vue {
  @Prop({
    required: true,
    type: Object as () => UploadFileSet
  })
  set!: UploadFileSet

  @Prop({
    required: true,
    type: Object as () => DatasetPayload
  })
  dataset!: DatasetPayload

  @Prop({ required: false, type: Boolean, default: false })
  hideTags!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  hideFolder!: boolean

  get thumbnails (): (string | ArrayBuffer)[] {
    return getThumbnailFromFiles(this.filesByCategory)
  }

  /**
   * Helper computed, returns a map of images in set, grouped by category.
   */
  get filesByCategory (): FilesByCategory {
    return this.set.files.reduce((acc, uploadFile) => {
      const { data } = uploadFile

      if (data.category === 'video') { acc.videos.push(uploadFile) }
      if (data.category === 'image') { acc.images.push(uploadFile) }
      if (data.category === 'other') { acc.others.push(uploadFile) }

      return acc
    }, {
      images: [],
      videos: [],
      others: []
    } as {
      images: UploadFile[],
      videos: UploadFile[],
      others: UploadFile[]
    })
  }

  get tags (): string[] {
    const { files } = this.set
    return files[0].data.tags || []
  }

  /**
   * When the set is received, we need to load file content in order to display thumbnails.
   *
   * Since we know the total limit of thumbnails shown, we only dispatch actions to load files
   * for those files we need for.
   *
   * Generally, this would be the first 3 videos in the set, followed by a number of images if
   * there are less than 3 videos.
   * */
  @Watch('set', { immediate: true })
  onSet (): void {
    const { thumbnails } = this
    if (thumbnails.length >= THUMB_LIMIT) { return }

    const { videos, images, others } = this.filesByCategory

    videos
      .filter(u => !u.data.thumbs)
      .slice(0, THUMB_LIMIT)
      .forEach(u => this.$store.dispatch('datasetUpload/getVideoInfo', u))

    if (videos.length >= THUMB_LIMIT) { return }

    images
      .filter(u => !u.data.dataURL)
      .slice(0, THUMB_LIMIT - videos.length)
      .forEach(u => this.$store.dispatch('datasetUpload/getFileContent', u))

    const setLength = videos.length + images.length
    if (setLength >= THUMB_LIMIT) { return }

    others
      .filter(u => !u.data.dataURL)
      .slice(0, THUMB_LIMIT - setLength)
      .forEach(u => this.$store.dispatch('datasetUpload/getOtherPlaceholder', u))
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.file-set {
  position: relative;
  display: flex;
  flex-direction: column;

  border-radius: 10px;
  padding-bottom: 4px;

  background: $colorAliceFade;
}

</style>
