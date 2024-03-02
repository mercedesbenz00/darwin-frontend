<template>
  <div class="dataset-create__box dataset-create__box--data">
    <FileUploadDialogCore
      ref="fileUploadDialog"
      v-if="dataset.version === 2"
      :popup-mode="false"
      class="dataset-create__file-upload-dialog-core"
      @files-added="onDropzoneFilesAdded"
      @submitted="onContinue"
    />
    <template
      v-else
    >
      <div class="dataset-create__box-left">
        <img
          :src="step.img"
          class="dataset-create__box__step-image"
        >
        <div class="dataset-create__box__step-writings">
          <div class="dataset-create__box__step-title">
            {{ step.title }}
          </div>
          <div class="dataset-create__box__step-description">
            {{ step.description }}
          </div>
        </div>
      </div>
      <div class="dataset-create__box-right">
        <div
          v-if="!isPickMode"
          class="dataset-data"
        >
          <div class="dataset-data__title">
            {{ title }}
          </div>
          <DropZone
            ref="dropZone"
            class="dataset-data__drop-zone"
            :dataset="dataset"
            hide-tags
            hide-folder
            @files-added="onDropzoneFilesAdded"
            @files-removed="onFilesRemoved"
          />
          <div class="dataset-data__column">
            <template v-if="uploadFiles.length === 0">
              <UploadCommands
                class="dataset-data__commands"
                :dataset="dataset"
              />
              <SecondaryButton
                class="dataset-data__pick"
                @click="pickExisting"
              >
                Pick existing Dataset
              </SecondaryButton>
            </template>

            <PositiveButton
              v-else
              @click="onContinue"
            >
              Continue
            </PositiveButton>
          </div>
        </div>
        <div
          v-else
          class="dataset-data"
        >
          <div
            class="dataset-data__title"
          >
            Continue with the next step to finish up your dataset creation and get started
          </div>
          <ImageZone
            ref="imagezone"
            :dataset="pickedDataset"
          />
          <div class="dataset-data__row">
            <SecondaryButton
              class="dataset-data__select-other"
              @click="pickExisting"
            >
              Select Other
            </SecondaryButton>
            <PositiveButton
              class="dataset-data__continue"
              @click="forkDataset"
            >
              Continue
            </PositiveButton>
          </div>
        </div>
      </div>
    </template>
    <VideoSettingsModal
      :upload-file="videoModalUploadFile"
      @cancel="onVideoCancelled"
      @start="onVideoOptionsSubmitted"
    />
    <PickDatasetModal
      v-if="dataset"
      ref="datasetModal"
      :destination-dataset="dataset"
      :selected-dataset.sync="pickedDataset"
      @close="onDatasetPickClose"
      @select="onDatasetPick"
    >
      <template #title>
        Settings for new Dataset
      </template>
      <template #description>
        You can select from all Datasets available on your team.
      </template>
      <template #actions>
        <SecondaryButton @click="onDatasetPickCancel">
          Upload new dataset
        </SecondaryButton>
        <PositiveButton
          :disabled="!pickedDataset"
          @click="onDatasetPick"
        >
          Select Dataset
        </PositiveButton>
      </template>
    </PickDatasetModal>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import PositiveButton from '@/components/Common/Button/V1/PositiveButton.vue'
import SecondaryButton from '@/components/Common/Button/V1/SecondaryButton.vue'
import DropZone from '@/components/Dataset/DropZone/V1/DropZone.vue'
import ImageZone from '@/components/Dataset/ImageZone.vue'
import PickDatasetModal from '@/components/Dataset/PickDatasetModal/PickDatasetModal.vue'
import UploadCommands from '@/components/Dataset/UploadCommands/UploadCommands.vue'
import VideoSettingsModal from '@/components/Dataset/VideoSettingsModal.vue'
import { useDatasetUploadDialog } from '@/components/Dataset/useDatasetUploadDialog'
import FileUploadDialogCore from '@/components/DatasetManagement/Dialog/FileUploadDialog/FileUploadDialogCore.vue'
import { useBreadcrumbs, useGA, useModal, useRouter, useStore } from '@/composables'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { DatasetPayload } from '@/store/types'

export default defineComponent({
  name: 'DataStep',
  components: {
    DropZone,
    ImageZone,
    FileUploadDialogCore,
    PickDatasetModal,
    UploadCommands,
    VideoSettingsModal,
    SecondaryButton,
    PositiveButton,
    SecondaryButton,
    PositiveButton
  },
  props: {
    dataset: { required: true, type: Object as () => DatasetPayload }
  },
  setup (props) {
    const store = useStore()
    const ga = useGA()
    const modal = useModal()
    const router = useRouter()

    const { uploadFiles, uploadInProgress } = useDatasetUpload()
    const {
      onDropzoneFilesAdded,
      onVideoCancelled,
      onVideoOptionsSubmitted,
      videoModalUploadFile
    } = useDatasetUploadDialog(ref(props.dataset), true, 'create_dataset')

    const step = {
      img: '/static/imgs/dataset-step2.png',
      title: 'Add Images or Video',
      description: [
        'Drag and drop images or video on the right,',
        'or use a CLI to upload large amounts of data at once.',
        'You may skip this step if you wish to set up this dataset prior to loading any image data.'
      ].join(' ')
    }

    const isPickMode = ref(false)
    const pickedDataset = ref<DatasetPayload | null>(null)

    const breadCrumbs = computed<BreadCrumb[]>(() => [
      { to: '/datasets', name: 'Datasets' },
      { to: `/datasets/create/${props.dataset.id}/data`, name: 'Dataset Creation' }
    ])

    useBreadcrumbs(breadCrumbs)

    const fileUploadDialog = ref<typeof FileUploadDialogCore | null>(null)

    const title = computed(() => {
      if (uploadInProgress.value) {
        return 'You can continue, the upload keeps running in the background'
      }

      return `Add data to ${props.dataset.name}`
    })

    watch(() => props.dataset.id, (datasetId) => {
      if (!datasetId) { return }
      store.commit('datasetUpload/SET_DATASET_ID', datasetId)
    }, { immediate: true })

    const datasetModal = ref<PickDatasetModal | null>(null)

    const pickExisting = (): void => {
      if (!datasetModal.value) { return }
      datasetModal.value.show()
      store.dispatch('ui/putBackSidebar')
    }

    const onDatasetPickClose = (): void => {
      modal.hide('pick-dataset-modal')
      store.dispatch('ui/bringFrontSidebar')
    }

    /**
       * Called when the user hits "continue" after "browsing computer for
       * dataset".
       */
    const onContinue = (): void => {
      ga.event('create_dataset', 'continue_step_2', 'success')
      const params = { datasetId: props.dataset.id.toString() }
      router.push({ name: 'DatasetCreationInstructionsStep', params })
    }

    /**
       * Called when the user cancels out of the "pick existing dataset" dialog.
       */
    const onDatasetPickCancel = (): void => {
      isPickMode.value = false
      modal.hide('pick-dataset-modal')
    }

    /**
       * Called when the user selects an existing dataset from the "pick existing
       * dataset" dialog.
       */
    const onDatasetPick = (): void => {
      if (!pickedDataset.value) {
        alert('You have to select existing dataset')
      } else {
        isPickMode.value = true

        modal.hide('pick-dataset-modal')
        store.dispatch('ui/bringFrontSidebar')
      }
    }

    /**
     * Called when user continues to next step, after selecting "pick existing
     * dataset" option.
     */
    const forkDataset = async (): Promise<void> => {
      if (!pickedDataset.value || !props.dataset) { return }
      const params = { parentId: pickedDataset.value.id, childId: props.dataset.id }
      const { error } = await store.dispatch('dataset/forkDataset', params)

      if (error) {
        const { code } = error
        return ga.event('create_dataset', 'pick_dataset', 'failure_request_failed', code)
      }

      ga.event('create_dataset', 'pick_dataset', 'success')

      onContinue()
    }

    const onFilesRemoved = (): void => {
      ga.event('create_dataset', 'remove_dataset', 'success')
    }

    return {
      datasetModal,
      fileUploadDialog,
      forkDataset,
      isPickMode,
      onContinue,
      onDatasetPick,
      onDatasetPickCancel,
      onDatasetPickClose,
      onDropzoneFilesAdded,
      onFilesRemoved,
      onVideoCancelled,
      onVideoOptionsSubmitted,
      pickedDataset,
      pickExisting,
      step,
      title,
      uploadFiles,
      videoModalUploadFile
    }
  }
})
</script>

<style lang="scss" scoped>
.dataset-create__box--data {
  @include row;
  .dataset-create__box-right {
    justify-content: initial;
    align-items: initial;
  }

  .dataset-create__file-upload-dialog-core {
    display: flex;
    flex-direction: column;
    padding: 40px;
    flex-grow: 1;
    max-width: 100%;
    background-color: $colorNeutralsWhite;

    :deep(.file-upload__footer) {
      background-color: transparent;
    }

    :deep(.modal-header-title-v2) {
      @include typography(xl-2, inter, 500);
      margin-bottom: 24px;
    }

    :deep(.modal-footer-v2) {
      padding-top: 16px;
    }
  }
}

.dataset-data {
  @include col;
  justify-content: center;
  width: calc(100% - 160px);
  margin: auto 80px;
  padding: 20px 0;
}

.dataset-data__title {
  margin-bottom: 30px;
  @include typography(xl, default, bold);
  line-height: 26px;
  color: $colorSecondaryDark1;

  @include respondFrom(xxl) {
    margin-bottom: 40px;
  }
}

.dataset-data__drop-zone {
  margin-bottom: 20px;

  @include respondFrom(xxl) {
    margin-bottom: 30px;
  }
}

:deep(.dropzone__progress__sets) {
  grid-template-columns: 1fr 1fr;
}

.dataset-data__column {
  @include col;
  width: 100%;
}

.dataset-data__pick {
  margin: 12px 0;
}

.dataset-data__commands {
  margin: 10px 0;

  :deep(.upload-commands__docs) {
    height: 30px;
  }
}

.dataset-data__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 24px;
  width: 100%;
  height: 50px;
}

.dataset-data__select-other,
.dataset-data__continue {
  @include respondTo(xl) {
    @include paddingLR(0px !important);
  }
}
</style>
