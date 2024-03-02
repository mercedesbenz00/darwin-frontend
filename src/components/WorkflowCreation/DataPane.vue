<template>
  <PullBox
    :up="!expanded"
    :down="expanded"
    @up="expand"
    @down="collapse"
  >
    <PanelFloatingWhite
      class="data-pane"
      :class="{'data-pane--expanded': expanded }"
    >
      <template #header>
        <div class="data-pane__header">
          <Paragraph14 v-if="dataset">
            Showing: <strong>{{ dataset.name }}</strong>
          </Paragraph14>
          <Paragraph14 v-else>
            Connect a dataset to the workflow to show data
          </Paragraph14>
          <div class="data-pane__header__actions">
            <ButtonBorderless
              v-if="expanded"
              @click="collapse"
            >
              <template #prefix>
                <CollapseDown />
              </template>
              Shrink panel
            </ButtonBorderless>
            <ButtonBorderless
              v-else
              @click="expand"
            >
              <template #prefix>
                <CollapseUp />
              </template>
              Expand panel
            </ButtonBorderless>
            <ToggleButton
              v-if="route && !uploadInProgress"
              size="sm"
              kind="primary"
              @click="showUploadDialog"
            >
              Add Data
            </ToggleButton>
            <UploadProgressButton
              v-else-if="route && uploadInProgress"
              dismissable
            />
            <ToggleButton
              v-if="route"
              :to="route"
            >
              Manage Dataset
            </ToggleButton>
          </div>
        </div>
      </template>
      <template
        v-if="dataset && route"
        #content
      >
        <DropArea
          :accepted-file-types="acceptedFileTypes"
          :open-file-picker-on-click="false"
          @files-added="setAndOpenFileDialog"
          class="data-pane__content"
        >
          <div class="data-pane__content__gallery">
            <V2DatasetItemGallery
              :dataset="dataset"
              :dataset-items="datasetItems"
              @update:dataset-items="updateDatasetItems"
            />
          </div>
          <V2ManagementContextMenu
            class="data-pane__menu"
            :dataset="dataset"
            :dataset-items="datasetItems"
          />
        </DropArea>
      </template>
      <template
        v-else-if="dataset"
        #content
      >
        <div class="data-pane__content__gallery">
          <V2DatasetItemGallery
            :dataset="dataset"
            :dataset-items="datasetItems"
            @update:dataset-items="updateDatasetItems"
          />
        </div>
        <V2ManagementContextMenu
          class="data-pane__menu"
          :dataset="dataset"
          :dataset-items="datasetItems"
        />
      </template>
    </PanelFloatingWhite>
    <FileUploadDialogWrapper />
  </PullBox>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { RawLocation } from 'vue-router'

import CollapseDown from '@/assets/icons/V2/Mono/CollapseDown.vue'
import CollapseUp from '@/assets/icons/V2/Mono/CollapseUp.vue'
import DropArea from '@/components/Common/DropArea/V2/DropArea.vue'
import { acceptedFileTypes } from '@/components/Common/DropArea/fileTypes'
import Paragraph14 from '@/components/Common/Paragraph14.vue'
import UploadProgressButton from '@/components/Dataset/UploadProgressButton/UploadProgressButton.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import V2ManagementContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/ManagementContextMenu.vue'
import FileUploadDialogWrapper from '@/components/DatasetManagement/Dialog/FileUploadDialog/FileUploadDialogWrapper.vue'
import V2DatasetItemGallery from '@/components/DatasetManagement/Gallery/V2DatasetItemGallery.vue'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { useItemsReloader } from '@/composables/useItemsReloader'
import { useStore } from '@/composables/useStore'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { setDatasetItemFilterV2 } from '@/store/modules/dataset/actions/setDatasetItemFilterV2'
import {
  StageType,
  StoreActionPayload,
  V2DatasetItemPayload,
  V2DatasetStagePayload,
  V2WorkflowStagePayload
} from '@/store/types'
import ButtonBorderless from '@/uiKit/Button/ButtonBorderless.vue'
import ToggleButton from '@/uiKit/Button/ToggleButton.vue'
import PanelFloatingWhite from '@/uiKit/Panel/PanelFloatingWhite.vue'
import PullBox from '@/uiKit/PullBox/PullBox.vue'
export default defineComponent({
  components: {
    ButtonBorderless,
    CollapseDown,
    CollapseUp,
    DropArea,
    FileUploadDialogWrapper,
    PanelFloatingWhite,
    Paragraph14,
    ToggleButton,
    UploadProgressButton,
    V2DatasetItemGallery,
    V2ManagementContextMenu,
    PullBox
  },
  name: 'DataPane',
  setup () {
    const store = useStore()
    const scene = useWorkflowSceneStore()

    const workflow = computed(() => store.state.v2Workflow.editedWorkflow)

    const dataset = computed(() => {
      const datasetStage = workflow.value?.stages
        .find(s => s.type === StageType.Dataset) as V2DatasetStagePayload | undefined

      if (!datasetStage) { return null }
      const datasetId =  datasetStage.config.dataset_id
      return store.state.dataset.datasets.find(d => d.id === datasetId) || null
    })

    const setCurrentDatasetId = (): void => {
      store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.value?.id || null)
    }

    setCurrentDatasetId()

    watch(dataset, () => {
      setCurrentDatasetId()
    })

    const selectedStage = computed(() => scene.selectedStage)

    watch(
      selectedStage,
      (stage: V2WorkflowStagePayload | null) => {
        const consensusStage = stage?.type === StageType.ConsensusEntrypoint
        const payload: StoreActionPayload<typeof setDatasetItemFilterV2> = !!stage
          ? { workflow_stage_ids: consensusStage
            ? stage.config.parallel_stage_ids
            : [stage.id]
          }
          : {}
        store.dispatch('dataset/setDatasetItemFilterV2', payload)
      },
      { immediate: true }
    )

    const route = computed<RawLocation | null>(() => {
      if (!dataset.value) { return null }
      // a workflow will later have multiple datasets
      // in those cases, we can't really sure which dataset we will manage,
      // unless the dataset stage is the one currently being selected
      if (selectedStage.value?.type !== StageType.Dataset) { return null }
      return {
        name: 'DatasetManagementData',
        params: { datasetId: dataset.value.id.toString() }
      }
    })

    const expanded = ref(false)
    const expand = (): void => { expanded.value = true }
    const collapse = (): void => { expanded.value = false }

    const datasetItems = ref<V2DatasetItemPayload[]>([])
    const updateDatasetItems = (newItems: V2DatasetItemPayload[]): void => {
      datasetItems.value = newItems
    }

    // this is a pretty messy way to make sure dataset items are synced via
    // websocket channel.
    const { channelDatasetItems } = useItemsReloader(datasetItems)
    watch(channelDatasetItems, () => {
      datasetItems.value = channelDatasetItems.value
    })

    const {
      setAndOpenFileDialog,
      showUploadDialog
    } = useDatasetUploadDialog(dataset, false, 'workflow_data_pane')

    const { uploadInProgress } = useDatasetUpload()

    return {
      acceptedFileTypes,
      collapse,
      dataset,
      expand,
      expanded,
      route,
      datasetItems,
      setAndOpenFileDialog,
      updateDatasetItems,
      uploadInProgress,
      showUploadDialog
    }
  }
})
</script>

<style scoped lang="scss">
@import "@/uiKit/assets/index.scss";

.data-pane {
  &__content {
    width: 100%;
    height: 100%;
  }

  &__content__gallery {
    width: 100%;
    height: max(160px, 20vh);
    overflow: auto;
    overflow-y: auto;
    transition: height ease .2s;
  }

  &--expanded {
    .data-pane__content__gallery {
      height: min(640px, 60vh);
    }
  }

  &__header {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: center;

    padding: $spacing-4;

    &__actions {
      display: flex;
      flex-direction: row;
      gap: $spacing-4;
      align-items: center;
    }

    strong {
      font-weight: 500;
    }
  }

  &__content {
    padding-left: $spacing-4;
    padding-right: $spacing-4;
  }

  &__menu {
    position: absolute;
    bottom: 30px;
    right: 0;
    left: 0;
    margin: auto;
  }
}
</style>
