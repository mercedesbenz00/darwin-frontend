<template>
  <div class="dataset-sidebar-footer__container">
    <dataset-connected
      v-if="isConnected"
      @disconnect-dataset="disconnectDataset"
    />
    <dataset-disconnected
      v-else
      @select-dataset="connectDataset"
      @create-new="createNewDataset"
    />
    <confirmation-dialog
      button-text="Disconnect"
      cancel-button-text="Cancel"
      name="confirm-disconnecting-dataset"
      title="Are you sure you want to disconnect Dataset?"
      detail="This action irreversibly clears assignees and unlinks all dataset items."
      :click-to-close="true"
      @confirmed="onModalSave"
      @canceled="onModalDiscard"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog/V2'
import DatasetConnected from '@/components/Workflow/Sidebar/Footers/Dataset/Connected.vue'
import DatasetDisconnected from '@/components/Workflow/Sidebar/Footers/Dataset/Disconnected.vue'
import { useToast, useModal, useStore } from '@/composables'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'

export default defineComponent({
  name: 'DatasetStageSidebarFooter',
  components: {
    DatasetConnected,
    DatasetDisconnected,
    ConfirmationDialog
  },
  setup () {
    const modal = useModal()
    const store = useStore()
    const scene = useWorkflowSceneStore()
    const toast = useToast()
    const stage = scene.selectedStage

    const isConnected = computed<boolean>(() =>
      !!stage && 'dataset_id' in stage.config && !!stage.config.dataset_id
    )

    const { updateStageConfig } = useEditedWorkflow()

    const connectDataset = (): void => {
      if (!stage) { return }
      if (!scene.selectedDatasetId) { return }

      updateStageConfig({
        stageId: stage.id,
        config: { dataset_id: scene.selectedDatasetId }
      })
    }

    const createNewDataset = async (name: string): Promise<void> => {
      if (!stage) { return }
      const { data, error } = await store.dispatch('dataset/createDataset', {
        name,
        isPublic: false
      })
      // the infrastructure about toast/warning does not seem to work here??
      if (error) {
        toast.warning({ meta: { title: error.name } })
        return
      }
      scene.selectDataset(data.id)
      connectDataset()
    }

    const disconnectDataset = (): void => {
      if (!stage) { return }
      modal.show('confirm-disconnecting-dataset')
    }

    const onModalDiscard = (): void => {
      modal.hide('confirm-disconnecting-dataset')
    }

    const onModalSave = (): void => {
      if (!stage) { return }
      scene.selectDataset(null)

      updateStageConfig({
        stageId: stage.id,
        config: { dataset_id: null }
      })
      modal.hide('confirm-disconnecting-dataset')
    }

    return {
      stage,
      isConnected,
      connectDataset,
      createNewDataset,
      disconnectDataset,
      onModalDiscard,
      onModalSave
    }
  }
})
</script>

<style lang="scss" scoped>
.dataset-sidebar-footer__container {
  & > div {
    display: grid;
    grid-template-rows: repeat(2, min-content);
    grid-row-gap: 6px;
  }
}
</style>
