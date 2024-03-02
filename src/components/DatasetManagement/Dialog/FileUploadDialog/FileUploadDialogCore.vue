<template>
  <div>
    <modal-header-v2
      :hide-close="!popupMode"
      @close="$emit('close')"
      class="file-upload"
    >
      <template #title>
        <modal-header-title-v2 class="file-upload__title">
          Add Data to the Dataset <strong
            v-tooltip="datasetName"
            class="file-upload__dataset-name"
          >
            {{ datasetName }}
          </strong>
        </modal-header-title-v2>
      </template>
    </modal-header-v2>

    <modal-content-v2
      v-loading="loading"
      class="file-upload__content"
    >
      <div class="file-upload__content-wrapper">
        <DropZone @files-added="$emit('files-added', $event)">
          <slot />
        </DropZone>

        <div
          v-if="uploadFiles.length > 0"
          class="file-upload__header header"
        >
          <div class="total-files">
            {{ totalFilesLabel }}
          </div>

          <div class="header__tools">
            <folder-tool />
            <tags-tool />
          </div>
        </div>

        <div class="file-upload__list">
          <file-item
            class="file-upload__file-item"
            v-for="fileItem in uploadFiles"
            :key="fileItem.file.name"
            :value="fileItem"
            @remove="removeUploadFiles([fileItem])"
          />
        </div>
      </div>

      <upload-commands />
    </modal-content-v2>

    <modal-footer-v2 class="file-upload__footer">
      <custom-button
        v-if="popupMode"
        variant="outline"
        flair="rounded"
        @click="$emit('close')"
      >
        Cancel
      </custom-button>

      <custom-button
        v-if="popupMode"
        class="submit-upload"
        color="primary"
        flair="rounded"
        :disabled="loading || uploadFiles.length === 0"
        @click="startFilesUpload"
      >
        {{ submitButtonLabel }}
      </custom-button>
      <custom-button
        v-else
        class="submit-upload"
        color="primary"
        flair="rounded"
        :disabled="loading || uploadFiles.length === 0"
        @click="goToNextStep"
      >
        Continue
      </custom-button>
    </modal-footer-v2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import DropZone from '@/components/Dataset/DropZone/V2/DropZone.vue'
import UploadCommands from '@/components/Dataset/UploadCommands/V2'
import { useToast } from '@/composables'
import { useDataset } from '@/composables/useDataset'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { useStore } from '@/composables/useStore'
import { tagSelectedItemsV2 } from '@/store/modules/dataset/actions/tagSelectedItemsV2'
import { AnnotationClassPayload, StoreActionPayload } from '@/store/types'
import { pluralize } from '@/utils'

import FileItem from './FileItem.vue'
import FolderTool from './FolderTool.vue'
import TagsTool from './TagsTool.vue'

/**
 * Used to add additional images to a dataset, from the data tab.
 */
export default defineComponent({
  name: 'FileUploadDialogCore',
  components: {
    DropZone,
    CustomButton,
    ModalHeaderV2,
    ModalHeaderTitleV2,
    ModalContentV2,
    ModalFooterV2,
    UploadCommands,
    FileItem,
    FolderTool,
    TagsTool
  },
  props: {
    popupMode: { type: Boolean, required: false, default: true }
  },
  setup (props, { emit }) {
    const toast = useToast()
    const store = useStore()
    const { dataset } = useDataset()
    const datasetName = computed(() => dataset.value?.name || '')

    const {
      addV1Files,
      addV2Files,
      removeUploadFiles,
      startV1Upload,
      startV2Upload,
      uploadFiles
    } = useDatasetUpload()

    const loading = ref(false)

    const submitButtonLabel = computed(
      () => `Upload ${pluralize(uploadFiles.value.length, 'file', 'files')}`
    )

    const totalFilesLabel = computed(
      () => pluralize(uploadFiles.value.length, 'file', 'files', true)
    )

    const startFilesUpload = async (): Promise<void> => {
      loading.value = true

      if (!dataset.value) { return }

      store.dispatch('ui/bringFrontSidebar')

      if (dataset.value.version === 2) {
        const response = await addV2Files(dataset, uploadFiles.value)
        if (response !== 'success') { return }
        startV2Upload()
      } else {
        const response = await addV1Files(dataset, uploadFiles.value)
        if (response !== 'success') { return }

        startV1Upload()
      }

      loading.value = false

      emit('submitted')
    }

    const setFolderForV2Items = async (path: string): Promise<void> => {
      if (dataset.value?.version !== 2) { return }

      const { error } = await store.dispatch('dataset/moveV2ItemsToPath', {
        dataset: dataset.value,
        path: path || '/',
        filters: { select_all: true }
      })
      if (error) { return toast.warning({ meta: { title: error.message } }) }
    }

    const setTagClassesForV2Items = async (classes: AnnotationClassPayload[]): Promise<void> => {
      if (dataset.value?.version !== 2) { return }

      store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)

      for (const item of classes) {
        const payload: StoreActionPayload<typeof tagSelectedItemsV2> = {
          dataset: dataset.value,
          annotationClassId: item.id,
          filters: { select_all: true }
        }

        const result = await store.dispatch('dataset/tagSelectedItemsV2', payload)

        if ('error' in result) {
          toast.warning({ meta: { title: result.error.message } })
        }
      }

      store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
    }

    const goToNextStep = async (): Promise<void> => {
      await setFolderForV2Items(store.state.datasetUpload.path)
      await setTagClassesForV2Items(store.state.datasetUpload.tagClasses)
      emit('submitted')
    }

    return {
      datasetName,
      goToNextStep,
      loading,
      removeUploadFiles,
      startFilesUpload,
      submitButtonLabel,
      totalFilesLabel,
      uploadFiles
    }
  }
})
</script>

<style lang="scss" scoped>
.file-upload {
  &__title {
    text-align: left;
    max-width: 100%;
  }

  &__header {
    margin-top: 15px;
  }

  &__list {
    margin-top: 10px;
    height: 35vh;
    overflow-y: auto;
    overflow-x: visible;
  }

  &__dataset-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: inherit;
    vertical-align: text-bottom;
    color: #131416;
  }

  &__content {
    display: grid;
    column-gap: 16px;
    min-height: 40vh;
    grid-template-columns: 1fr 40%;

    overflow-x: hidden;

    &-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :deep(.file-upload__list) {
      flex-grow: 1
    }
  }

  &__footer {
    justify-content: flex-end;
  }

  &__file-item {
    margin-bottom: 2px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__tools {
    display: flex;
    justify-content: space-between;
  }
}

.total-files {
  @include typography(md, inter, 500);
  color: $colorContentSecondary;
}
</style>
