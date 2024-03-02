import { Ref, ref } from 'vue'

import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { useGA } from '@/composables/useGA'
import { useModal } from '@/composables/useModal'
import { useStore } from '@/composables/useStore'
import { UploadFile } from '@/store/modules/datasetUpload/types'
import { DatasetPayload } from '@/store/types'

export type UploadEventParams = { file: File }

export interface QueuedFile extends File {
  name: string
  framerate?: number
}

type QueuedOption = {
  type: string
  uploadFile?: UploadFile
  uploadFiles?: UploadFile[]
};

const getFilesByGroup = (uploadFiles: UploadFile[]): [UploadFile[], UploadFile[]] => {
  const videoFiles = Array.from(uploadFiles).filter((u) =>
    ['video', 'dicom', 'pdf'].includes(u.data.category)
  )
  const imageFiles = Array.from(uploadFiles).filter((u) =>
    ['image', 'other'].includes(u.data.category)
  )

  return [videoFiles, imageFiles]
}

type VideoOptions = {
  uploadFile: UploadFile,
  framerate: number,
  annotateAsFrames: boolean
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useFileUploadDialog = (queuedOptions: Ref<QueuedOption[]>) => {
  const modal = useModal()
  const store = useStore()
  const { resetUploadFiles } = useDatasetUpload()

  const reset = (): void => {
    queuedOptions.value = []
  }

  const UPLOAD_DIALOG = 'file-upload-dialog'

  const submitUploadDialog = (): void => {
    reset()
    modal.hide(UPLOAD_DIALOG)
    store.dispatch('ui/bringFrontSidebar')
  }

  const showUploadDialog = (): void => {
    reset()
    modal.show(UPLOAD_DIALOG)
    store.dispatch('ui/putBackSidebar')
  }

  const closeUploadDialog = (): void => {
    reset()
    modal.hide(UPLOAD_DIALOG)
    store.dispatch('ui/bringFrontSidebar')
    resetUploadFiles()
  }

  return {
    closeUploadDialog,
    submitUploadDialog,
    showUploadDialog
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useVideoModal = () => {
  const modal = useModal()
  const store = useStore()

  const VIDEO_MODAL = 'video-modal'

  const { setCurrentUploadFile } = useDatasetUpload()

  /**
   * Calls all actions required to show a video modal, for a dropped video
   */
  const showVideoModal = ({ uploadFile }: QueuedOption): void => {
    if (!uploadFile) { return }
    setCurrentUploadFile(uploadFile)
    setTimeout(() => {
      modal.show(VIDEO_MODAL)
      store.dispatch('ui/putBackSidebar')
    }, 500)
  }

  /**
   * Calls all required actions for the interface to shift from the modal to the main screen.
   */
  const closeVideoModal = (): void => {
    modal.hide(VIDEO_MODAL)
    setCurrentUploadFile(null)
    store.dispatch('ui/bringFrontSidebar')
  }

  return {
    closeVideoModal,
    showVideoModal
  }
}

/**
 * Used to share logic related to how uploads added to the upload dialog are processed
 *
 * Typically, plain image files are processed as is,
 * videos need to be configured one by one, etc.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDatasetUploadDialog = (
  dataset: Ref<DatasetPayload | null>,
  autostart: boolean,
  analyticsContext: 'create_dataset' | 'dataset_management' | 'workflow_data_pane'
) => {
  const queuedOptions = ref<QueuedOption[]>([])
  const ga = useGA()

  const {
    addV1Files,
    addV2Files,
    createUploadFiles,
    currentUploadFile,
    removeUploadFiles,
    setFileData,
    startV1Upload,
    startV2Upload,
    uploadFiles
  } = useDatasetUpload()

  const { closeVideoModal, showVideoModal } = useVideoModal()

  const autoStartUpload = async (): Promise<void> => {
    if (!dataset.value) { return }
    const addedFiles = uploadFiles.value.filter(f => f.data.status === 'added')

    if (addedFiles.length <= 0) { return }

    if (dataset.value.version === 2) {
      const result = await addV2Files(dataset, addedFiles)
      if (result !== 'success') { return }
      await startV2Upload()
      return
    }

    const result = await addV1Files(dataset, addedFiles)
    if (result !== 'success') { return }
    await startV1Upload()
    return
  }

  /**
   * Pops a file option from the options queue and processes it.
   * If there are no more options, optionally starts upload of queued files.
   */
  const processNextOption = async (): Promise<void> => {
    if (!dataset.value) { return }

    const option = queuedOptions.value.pop()

    // no more options to process and auto-start is enabled
    // -> immediately start upload in the background
    // the user can still queue up more files as upload is running
    if (!option && autostart) {
      return await autoStartUpload()
    }

    // no more options and auto-start is disabled
    // - > stop processing
    // user can queue up more or start upload manually
    if (!option) { return }

    const isVideo = option.type === 'video'

    const isDicomOrPdf =
      option.uploadFile?.data.category &&
      ['dicom', 'pdf'].includes(option.uploadFile?.data.category)

    // a plain video needs to be configured via a modal
    if (isVideo && !isDicomOrPdf) { return showVideoModal(option) }

    // anything else is just silently added to the queue and we move to next
    // option
    return processNextOption()
  }

  /**
   * Event handler for when files are added to the dropzone.
   *
   * It will queue video modals for any videos, followed by just calling `onFilesAdded`
   */
  const onDropzoneFilesAdded = (uploadFiles: UploadFile[]): void => {
    const [videoFiles, imageFiles] = getFilesByGroup(uploadFiles)

    videoFiles.forEach((uploadFile) =>
      queuedOptions.value.push({ type: 'video', uploadFile })
    )

    if (imageFiles.length > 0) {
      queuedOptions.value.push({ type: 'files', uploadFiles: imageFiles })
    }

    processNextOption()
  }

  const cancelUploadFile = async ({ uploadFile }: { uploadFile: UploadFile }): Promise<void> => {
    await removeUploadFiles([uploadFile])
    processNextOption()
  }

  const onVideoOptionsSubmitted = async (params: VideoOptions): Promise<void> => {
    if (!dataset.value) { return }

    const { uploadFile, framerate, annotateAsFrames } = params

    setFileData({
      uploadFile,
      data: { extractRate: framerate },
      annotateAsFrames
    })

    ga.event(analyticsContext, 'configure_dataset_framerate')

    await processNextOption()
  }

  /**
   * Called when the video modal to set the framerate for a video is cancelled.
   */
  const onVideoCancelled = (params: { uploadFile: UploadFile }): void => {
    cancelUploadFile(params)
    ga.event(analyticsContext, 'cancel_video', 'success')
  }

  const {
    showUploadDialog,
    submitUploadDialog,
    closeUploadDialog
  } = useFileUploadDialog(queuedOptions)

  const setAndOpenFileDialog = async (files: FileList | File[]): Promise<void> => {
    const uploadFiles = await createUploadFiles(files)
    if (uploadFiles.length === 0) { return }

    showUploadDialog()
    onDropzoneFilesAdded(uploadFiles)
  }

  return {
    onDropzoneFilesAdded,

    // video modal
    closeVideoModal,
    onVideoCancelled,
    onVideoOptionsSubmitted,
    showVideoModal,
    videoModalUploadFile: currentUploadFile,

    // upload dialog
    submitUploadDialog,
    showUploadDialog,
    closeUploadDialog,
    setAndOpenFileDialog
  }
}
