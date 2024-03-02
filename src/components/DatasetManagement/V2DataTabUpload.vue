<template>
  <div class="data-tab-upload">
    <DarwinButton
      v-if="!uploadInProgress"
      size="sm"
      kind="primary"
      @click="showUploadDialog"
    >
      + Add Data
    </DarwinButton>
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

import UploadProgressButton from '@/components/Dataset/UploadProgressButton/UploadProgressButton.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import FileUploadDialog from '@/components/DatasetManagement/Dialog/FileUploadDialog'
import { useDataset } from '@/composables/useDataset'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import DarwinButton from '@/uiKit/Button/DarwinButton.vue'

/**
 * Renders upload/upload progress UI in dataset management.
 */
export default defineComponent({
  name: 'V2DataTabUpload',
  components: {
    DarwinButton,
    FileUploadDialog,
    UploadProgressButton
  },
  setup () {

    const { uploadInProgress } = useDatasetUpload()
    const { dataset }  = useDataset()
    const { showUploadDialog } = useDatasetUploadDialog(dataset, false, 'dataset_management')

    return {
      uploadInProgress,
      showUploadDialog
    }
  }
})
</script>
