<template>
  <div class="export-button">
    <DarwinButton
      size="sm"
      kind="secondary"
      @click="openExportDialog"
    >
      Export Data
    </DarwinButton>
    <v2-export-dialog
      ref="exportDialog"
      :is-open-mode="isOpenMode"
      @createExport="createExport"
    />
    <post-export-dialog ref="postExportDialog" />
    <v2-new-export-dialog ref="newExportDialog" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref
} from 'vue'

import PostExportDialog from '@/components/DatasetManagement/Dialog/PostExportDialog.vue'
import V2ExportDialog from '@/components/DatasetManagement/ExportDialog/V2/V2ExportDialog.vue'
import V2NewExportDialog from '@/components/DatasetManagement/ExportDialog/V2/V2NewExportDialog.vue'
import { useStore } from '@/composables'
import DarwinButton from '@/uiKit/Button/DarwinButton.vue'

export default defineComponent({
  name: 'ExportButton',
  components: {
    DarwinButton,
    V2ExportDialog,
    V2NewExportDialog,
    PostExportDialog
  },
  props: {
    buttonType: {
      required: false,
      type: String as () => 'primary-button' | 'secondary-light-button',
      default: 'secondary-light-button'
    },
    isOpenMode: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  setup () {
    const { dispatch } = useStore()
    const exportDialog: Ref<InstanceType<typeof V2ExportDialog> | null> = ref(null)
    const postExportDialog: Ref<InstanceType<typeof PostExportDialog> | null> = ref(null)
    const newExportDialog: Ref<InstanceType<typeof V2NewExportDialog> | null> = ref(null)

    const openExportDialog = (): void => {
      if (!exportDialog.value) { return }
      exportDialog.value.show()
      dispatch('ui/putBackSidebar')
    }

    const createExport = (): void => {
      if (!newExportDialog.value) { return }
      newExportDialog.value.show()
    }

    return {
      exportDialog,
      postExportDialog,
      newExportDialog,
      createExport,
      openExportDialog
    }
  }
})
</script>
