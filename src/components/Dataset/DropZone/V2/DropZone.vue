<script lang="ts">

import { defineComponent } from 'vue'

import DropArea from '@/components/Common/DropArea/V2/DropArea.vue'
import { useDatasetUploadDropzone } from '@/composables/useDatasetUploadDropZone'

export default defineComponent({
  components: { DropArea },
  emits: ['files-added', 'files-updated', 'files-removed'],
  setup (props, { emit } ) {
    const acceptedFileTypes = [
      'application/pdf',
      'image/*',
      'video/*',
      '.avi',
      '.bmp',
      '.dcm',
      '.gz',
      '.hevc',
      '.jpeg',
      '.jpg',
      '.mkv',
      '.mov',
      '.mp4',
      '.ndpi',
      '.nii.gz',
      '.nii',
      '.pdf',
      '.png',
      '.rvg',
      '.svs',
      '.tif',
      '.tiff',
      '.webp'
    ]

    const { addFiles } = useDatasetUploadDropzone(emit)
    return {
      acceptedFileTypes,
      addFiles
    }
  }
})

</script>

<template>
  <DropArea
    :accepted-file-types="acceptedFileTypes"
    @files-added="addFiles"
  />
</template>
