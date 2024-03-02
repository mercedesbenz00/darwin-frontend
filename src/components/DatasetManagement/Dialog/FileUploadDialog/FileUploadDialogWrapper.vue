<template>
  <Portal to="modal">
    <ModalV2
      name="file-upload-dialog"
      size="large"
      translate="pop-out"
      height="auto"
      :click-to-close="false"
    >
      <FileUploadDialogCore
        @close="closeUploadDialog"
        @submitted="submitUploadDialog"
        @files-added="onDropzoneFilesAdded"
      />
    </ModalV2>

    <VideoSettingsModal
      :upload-file="videoModalUploadFile"
      @cancel="onVideoCancelled"
      @start="onVideoOptionsSubmitted"
    />
  </Portal>
</template>

<script lang="ts">
import { Portal } from 'portal-vue'
import { defineComponent } from 'vue'

import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import VideoSettingsModal from '@/components/Dataset/VideoSettingsModal.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import { useDataset } from '@/composables/useDataset'

import FileUploadDialogCore from './FileUploadDialogCore.vue'

export default defineComponent({
  name: 'FileUploadDialogWrapper',
  components: {
    FileUploadDialogCore,
    Portal,
    ModalV2,
    VideoSettingsModal
  },
  setup () {
    const { dataset } = useDataset()

    const {
      closeUploadDialog,
      onDropzoneFilesAdded,
      onVideoCancelled,
      onVideoOptionsSubmitted,
      showUploadDialog,
      submitUploadDialog,
      videoModalUploadFile
    } = useDatasetUploadDialog(dataset, false, 'dataset_management')

    return {
      close,
      submitUploadDialog,
      closeUploadDialog,
      showUploadDialog,
      onDropzoneFilesAdded,
      onVideoCancelled,
      onVideoOptionsSubmitted,
      videoModalUploadFile
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
