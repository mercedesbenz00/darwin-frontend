<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--active': uploadFiles.length > 0 }"
  >
    <DroppedFiles
      :dataset="dataset"
      :hide-tags="hideTags"
      :hide-folder="hideFolder"
    />
    <DropArea
      class="dropzone__droparea"
      :accepted-file-types="acceptedFileTypes"
      @files-added="addFiles"
    >
      <slot />
    </DropArea>
  </div>
</template>
<script lang="ts">

import { defineComponent } from 'vue'

import DropArea from '@/components/Common/DropArea/V1/DropArea.vue'
import { acceptedFileTypes } from '@/components/Common/DropArea/fileTypes'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { useDatasetUploadDropzone } from '@/composables/useDatasetUploadDropZone'
import { DatasetPayload } from '@/store/types'

import DroppedFiles from './DroppedFiles.vue'

export default defineComponent({
  components: { DropArea, DroppedFiles },
  props: {
    dataset: { type: Object as () => DatasetPayload, required: true },
    hideTags: { type: Boolean, required: false, default: false },
    hideFolder: { type: Boolean, required: false, default: false }
  },
  emits: ['files-added', 'files-updated', 'files-removed'],
  setup (props, { emit }) {
    const { uploadFiles } = useDatasetUpload()
    const { addFiles } = useDatasetUploadDropzone(emit)

    return {
      acceptedFileTypes,
      addFiles,
      uploadFiles
    }
  }
})

</script>

<style lang="scss" scoped>
.dropzone {
  width: 100%;
  position: relative;
}

.dropzone__droparea {
  min-height: 150px;
  background: $colorAliceShade;
}

.dropzone--active {
  .dropzone__droparea {
    height: 60px;
    @include respondFrom(xl) {
      height: 90px;
    }
  }
}
</style>
