<template>
  <div class="data-tab-upload">
    <PrimaryButton
      v-if="!uploadInProgress"
      class="data-tab-upload__start"
      size="medium"
      @click="showUploadDialog"
    >
      + ADD DATA
    </PrimaryButton>
    <UploadProgressButton
      v-else
      class="data-tab-upload__progress"
      dismissable
    />
    <FileUploadDialog />
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'

import UploadProgressButton from '@/components/Dataset/UploadProgressButton.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import FileUploadDialog from '@/components/DatasetManagement/Dialog/FileUploadDialog'
import { useDataset } from '@/composables/useDataset'
import { useDatasetUpload } from '@/composables/useDatasetUpload'

/**
 * Renders upload/upload progress UI in dataset management.
 */
export default defineComponent({
  name: 'DataTabUpload',
  components: {
    FileUploadDialog,
    UploadProgressButton
  },
  setup () {
    const { uploadInProgress } = useDatasetUpload()
    const { dataset } = useDataset()
    const { showUploadDialog } = useDatasetUploadDialog(dataset, false, 'dataset_management')

    return {
      showUploadDialog,
      uploadInProgress
    }
  }
})
</script>

<style lang="scss" scoped>
.data-tab-upload {
  width: 100%;
}
.data-tab-upload__start,
.data-tab-upload__progress {
  width: 100%;
}
</style>
