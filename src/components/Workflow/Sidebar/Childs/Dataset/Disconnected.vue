<template>
  <div class="dataset-sidebar-child-disconnected__wrapper">
    <div class="dataset-sidebar-child-disconnected__container">
      <input-field
        :value="searchText"
        autofocus
        placeholder="Search by dataset name"
        @change="onSearchTextChange"
      />
    </div>
    <div class="dataset-sidebar-child-disconnected__container dataset-cards-container">
      <dataset-card-v2
        v-for="{ dataset, selected, selectable } in datasetCardProps"
        :key="dataset.id"
        :dataset="dataset"
        :selected="selected"
        :selectable="selectable"
        @click.native="selectDataset(dataset)"
        @dblclick.native="connectDataset(dataset)"
      />
    </div>
  </div>
</template>

<script lang='ts'>

import { sortBy } from 'lodash'
import { computed, defineComponent, ref } from 'vue'

import InputField from '@/components/Common/InputField/V2/InputField.vue'
import DatasetCardV2 from '@/components/Dataset/DatasetCard/V2/DatasetCard.vue'
import { useStore } from '@/composables'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { useEditedWorkflow } from '@/pinia/useEditedWorkflow'
import { DatasetPayload, V2DatasetStagePayload, V2WorkflowPayload } from '@/store/types'
import { StageType } from '@/store/types/StageType'

const findDatasetId = (w?: V2WorkflowPayload | null): number | null =>
  (w?.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload)?.config.dataset_id

export default defineComponent({
  name: 'DatasetStageSidebarChildDisconnected',
  components: { DatasetCardV2, InputField },
  setup () {
    const searchText = ref('')
    const store = useStore()
    const scene = useWorkflowSceneStore()

    const alreadyAssignedDatasetIds = computed(() => new Set(
      store.state.v2Workflow.workflows
        .filter(w => w.id !== store.state.v2Workflow.editedWorkflow?.id)
        .map(findDatasetId)
        .filter(id => id !== null)
    ))

    const isAlreadyConnected = (dataset: DatasetPayload): boolean =>
      alreadyAssignedDatasetIds.value.has(dataset.id)

    const datasets = computed(() => {
      return sortBy(store.state.dataset.datasets
        .filter(ds => ds.version === 2)
        .filter(ds => ds.name.toLowerCase().includes(searchText.value.toLowerCase())),
      ds => isAlreadyConnected(ds) ? 1 : 0)
    })

    const stage = scene.selectedStage

    const selectDataset = (dataset: DatasetPayload): void => {
      if (!stage) { return }
      if (alreadyAssignedDatasetIds.value.has(dataset.id)) { return }
      scene.selectDataset(dataset.id)
    }

    const { updateStageConfig } = useEditedWorkflow()

    const connectDataset = (dataset: DatasetPayload): void => {
      if (!stage) { return }
      if (alreadyAssignedDatasetIds.value.has(dataset.id)) { return }

      selectDataset(dataset)
      updateStageConfig({
        stageId: stage.id,
        config: {
          dataset_id: dataset.id
        }
      })
    }

    const isSelected = (dataset: DatasetPayload): boolean =>
      !!scene.selectedDatasetId &&
      dataset.id === scene.selectedDatasetId

    const onSearchTextChange = (newVal: string): void => {
      searchText.value = newVal
    }

    const datasetCardProps = computed(() =>
      datasets.value.map(dataset => ({
        dataset,
        selected: isSelected(dataset),
        selectable: !isAlreadyConnected(dataset)
      }))
    )

    return {
      datasetCardProps,
      connectDataset,
      selectDataset,
      searchText,
      onSearchTextChange
    }
  }
})
</script>

<style lang='scss' scoped>
.dataset-sidebar-child-disconnected__container {
  display: grid;
  grid-template-rows: repeat(auto-fit, min-content);
  grid-row-gap: 8px;
  padding: 12px;
}

.dataset-sidebar-child-disconnected__wrapper {
  height: 100%;
}

.dataset-cards-container {
  max-height: calc(100% - 60px);
  overflow-y: auto;
}
</style>
