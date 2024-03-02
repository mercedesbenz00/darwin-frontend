import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useToast } from '@/composables'
import { useStore } from '@/composables/useStore'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUploadProgress =  (props: { dismissable: boolean }) => {
  const { commit, getters } = useStore()

  const uploadProgress = computed<number | null>(() => getters['datasetUpload/uploadProgress'])

  const hovers = ref(false)

  const buttonTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  const resetUpload = (): void => {
    commit('datasetUpload/STOP_UPLOAD')
  }

  const checkUploadProgressAndReset = (): void => {
    if (!props.dismissable) { return }

    if (uploadProgress.value === 100) {
      buttonTimeout.value = setTimeout(() => resetUpload(), 5000)
    }
  }

  watch(uploadProgress, () => {
    checkUploadProgressAndReset()
  })

  onMounted(() => {
    checkUploadProgressAndReset()
  })

  onBeforeUnmount(() => {
    if (buttonTimeout.value) {
      clearTimeout(buttonTimeout.value)
    }
  })

  const toast = useToast()

  /**
   * Called when the user clicks the upload progress indicator, which appears
   * in place of the "add to dataset" button, when an upload is in progress.
   *
   * Note that `useDatasetUploadDialog.showUploadDialog` is called if the user
   * clicks the "add data" button in various places while there's no upload in
   * progress.
   */
  const clearUploadIfFinished = (): void => {
    if (!props.dismissable) { return }

    if (uploadProgress.value === 100) {
      resetUpload()
    } else {
      toast.info({ meta: { title: 'Images are being uploaded at the moment' } })
    }
  }

  return {
    clearUploadIfFinished,
    /**
     * Tracks wheter user is hovering mouse over button, which affects the button
     * label while upload is in progress.
     */
    hovers,
    uploadProgress
  }
}
