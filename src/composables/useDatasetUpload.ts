import { computed, Ref } from 'vue'

import { UploadFile, UploadFileSet } from '@/components/Dataset/DropZone/types'
import { getBlockedFilesMessage } from '@/components/Dataset/utils'
import {
  updateDatasetData,
  updateDatasetDataV2
} from '@/store/modules/dataset/actions/updateDatasetData'
import { addFiles as addFilesAction } from '@/store/modules/datasetUpload/actions/addFiles'
import { removeFiles } from '@/store/modules/datasetUpload/actions/removeFiles'
import { startUpload, startUploadV2 } from '@/store/modules/datasetUpload/actions/startUpload'
import { updateFiles } from '@/store/modules/datasetUpload/actions/updateFiles'
import { TERMINAL_STATUSES } from '@/store/modules/datasetUpload/helpers'
import {
  SET_CURRENT_UPLOAD_FILE
} from '@/store/modules/datasetUpload/mutations/SET_CURRENT_UPLOAD_FILE'
import { SET_FILE_DATA } from '@/store/modules/datasetUpload/mutations/SET_FILE_DATA'
import {
  DEFAULT_DICOM_RATE,
  DEFAULT_PDF_RATE,
  isUploadDicom,
  isUploadPdf,
  isUploadVideo,
  UploadFileData
} from '@/store/modules/datasetUpload/types'
import {
  DatasetItemUploadedItemPayload,
  DatasetPayload,
  DatasetUploadedItemsPayload,
  DatasetUploadedItemsPayloadV2,
  DatasetUploadItemPayload,
  DatasetUploadItemPayloadV2,
  StoreActionPayload,
  StoreActionResponse,
  StoreMutationPayload
} from '@/store/types'
import { ErrorWithMessage, ParsedValidationError } from '@/utils'
import { ErrorCodes } from '@/utils/error/errors'

import { useStore } from './useStore'
import { useToast } from './useToast'

type UploadFileWithData = { uploadFile: UploadFile; data: Partial<UploadFileData> }

/**
 * Merges a v1 `UploadFile[]` collection with an optional path and tag and
 * converts to payload expected by the backend register endpoint.
 */
const getDatasetUploadItemPayloads = (
  uploadFiles: UploadFile[],
  path?: string,
  tags?: string[]
): DatasetUploadItemPayload[] =>
  uploadFiles.map(uploadFile => {
    const fileParam: DatasetUploadItemPayload = { filename: uploadFile.file.name }
    if (path && path !== '') { fileParam.path = path }
    if (tags && tags.length > 0 ) { fileParam.tags = tags }

    if (isUploadVideo(uploadFile)) {
      fileParam.fps = uploadFile.data.extractRate!
      fileParam.as_frames = uploadFile.annotateAsFrames
    } else if (isUploadDicom(uploadFile)) {
      fileParam.fps = DEFAULT_DICOM_RATE
      fileParam.extract_views = uploadFile.data.extractViews
      fileParam.as_frames = false
    } else if (isUploadPdf(uploadFile)) {
      fileParam.fps = DEFAULT_PDF_RATE
      fileParam.as_frames = false
    }

    return fileParam
  })

/**
 * Merges a v2 `UploadFile[]` collection with an optional path and tag and
 * converts to payload expected by the backend register endpoint.
 */
const getDatasetUploadItemPayloadsV2 = (
  uploadFiles: UploadFile[],
  path?: string,
  tags?: string[]
): DatasetUploadItemPayloadV2[] =>
  uploadFiles.map(uploadFile => {
    const fileParam: DatasetUploadItemPayloadV2 = { file_name: uploadFile.file.name }
    if (path && path !== '') { fileParam.path = path }
    if (tags && tags.length > 0 ) { fileParam.tags = tags }

    if (isUploadVideo(uploadFile)) {
      fileParam.fps = uploadFile.data.extractRate!
      fileParam.as_frames = uploadFile.annotateAsFrames
    } else if (isUploadDicom(uploadFile)) {
      fileParam.fps = DEFAULT_DICOM_RATE
      fileParam.extract_views = uploadFile.data.extractViews
      fileParam.as_frames = false
    } else if (isUploadPdf(uploadFile)) {
      fileParam.fps = DEFAULT_PDF_RATE
      fileParam.as_frames = false
    }

    return fileParam
  })

/**
 * Composable to wrap around the datasetUpload Vuex store module.
 * Can be used to gradually shift towards a Pinia store
 *
 * This should wrapp all `datasetUpload` store actions, getters and mutations
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDatasetUpload = () => {
  const store = useStore()
  const toast = useToast()

  /**
   * Takes a list of `File[]` or `FileList` dropped onto a dropzone or picked
   * using a file dialog and pushes them as `UploadFile[]` into the store
   */
  const createUploadFiles = async (files: FileList | File[]): Promise<UploadFile[]> => {
    const response: StoreActionResponse<typeof addFilesAction> =
      await store.dispatch('datasetUpload/addFiles', files)

    if ('error' in response) {
      // not actually possible, check the action to confirm
      throw new Error('datasetUpload/addFiles is not supposed to return an error response' )
    }

    return response.data
  }

  /**
   * `UploadFile[]` records currently held in the store
   */
  const uploadFiles = computed(() => store.state.datasetUpload.files)

  /**
   * Current `UploadFile[]` collection in the store grouped by set, where a set
   * is a collection of files picked in a single user action.
   */
  const sets = computed(() => {
    const setMap = new Map<number, UploadFileSet>()

    uploadFiles.value.forEach(u => {
      if (!setMap.has(u.data.setId)) {
        const newSet: UploadFileSet = { id: u.data.setId, files: [] }
        setMap.set(u.data.setId, newSet)
      }

      const set: UploadFileSet = setMap.get(u.data.setId)!
      set.files.push(u)
    })

    return Array.from(setMap.values())
  })

  /**
   * Adds new data to an `UploadFile[]` collection already in the store
   */
  const updateUploadFiles = (
    payload: StoreActionPayload<typeof updateFiles>
  ): Promise<StoreActionResponse<typeof updateFiles>> =>
    store.dispatch('datasetUpload/updateFiles', payload)

  /**
   * Sets additional upload data onto an `UploadFile` record
   *
   * Typed wrapper around `datasetUpload/SET_FILE_DATA`
   */
  const setFileData = (payload: StoreMutationPayload<typeof SET_FILE_DATA>): void =>
    store.commit('datasetUpload/SET_FILE_DATA', payload)

  /**
   * Removes an `UploadFile[]` collection from the store
   */
  const removeUploadFiles = async (files: UploadFile[]): Promise<void> => {
    const payload: StoreActionPayload<typeof removeFiles> = files
    await store.dispatch('datasetUpload/removeFiles', payload)
    return
  }

  /**
   * Clears all `UploadFile` records from state
   *
   * Typed wrapper around `datasetUpload/RESET_FILES`
   */
  const resetUploadFiles = (): void => {
    store.commit('datasetUpload/RESET_FILES')
  }

  /**
   * Returns `true` if upload is currently in progress in the store
   */
  const uploadInProgress = computed<boolean>(() => store.state.datasetUpload.status === 'started')

  /**
   * Returns subset of `UploadFile[]` the processing of which hasn't terminated
   * yet (meaning it's not uploaded or errored)
   */
  const unfinishedFiles = computed(
    () => uploadFiles.value.filter(u => TERMINAL_STATUSES.indexOf(u.data.status) === -1)
  )

  /**
   * Combines the backend response for the request which created file records in
   * the database, with the file list in the store, associating each selected
   * file with it's db id, key and signing url.
   *
   * Merges this data into `UploadFile[]` records already in the store
   */
  const processV1RegistrationResponse = (
    params: DatasetUploadedItemsPayload,
    uploadFiles: UploadFile[]
  ): void => {
    const { items, blocked_items: blockedItems } = params

    const itemsMap = new Map<string, DatasetItemUploadedItemPayload>(
      items.map((item) => [item.filename, item])
    )

    // backend could block fome files, for example,
    // if the filename is already in dataset.
    // The response will contain them under data.blocked_items.
    const blockedItemsMap = new Map<string, DatasetItemUploadedItemPayload>(
      blockedItems.map((item) => [item.filename, item])
    )

    const blockedFileNames: string[] = []

    const fileData = uploadFiles.reduce((acc, uploadFile) => {
      const newItem = itemsMap.get(uploadFile.file.name)

      if (newItem) {
        const { dataset_item_id: id } = newItem
        const data: Partial<UploadFileData> = {
          datasetItemId: id,
          signingURL: `dataset_items/${id}/sign_upload`
        }
        acc.push({ uploadFile, data })
      }

      // If the item is blocked, we just set blocked to true, so store can track it.
      // This file will be skipped and counted as already uploaded.
      const blockedItem = blockedItemsMap.get(uploadFile.file.name)
      if (blockedItem) {
        const { dataset_item_id: id } = blockedItem
        const data: Partial<UploadFileData> = {
          datasetItemId: id,
          blocked: true
        }
        acc.push({ uploadFile, data })
        blockedFileNames.push(uploadFile.file.name)
      }
      return acc
    }, [] as UploadFileWithData[])

    if (blockedFileNames.length) {
      toast.warning({ meta: { title : getBlockedFilesMessage(blockedFileNames) } })
    }

    store.commit('datasetUpload/SET_FILES_DATA', fileData)
  }

  /**
   * Combines the backend response for the request which created file records in
   * the database, with the file list in the store, associating each selected
   * file with it's db id, key and signing url.
   *
   * Merges this data into `UploadFile[]` records already in the store
   */
  const processV2RegistrationResponse = ({
    teamSlug,
    datasetSlug,
    params,
    uploadFiles
  }: {
      teamSlug: string
      datasetSlug: string
      params: DatasetUploadedItemsPayloadV2
      uploadFiles: UploadFile[]
    }): void => {
    const { items, blocked_items: blockedItems } = params

    const itemsMap = new Map<string, DatasetUploadItemPayloadV2>()

    items.forEach((item) =>
      item.slots.forEach((file) => itemsMap.set(file.file_name, file))
    )
    // backend could block fome files, for example,
    // if the filename is already in dataset.
    // The response will contain them under data.blocked_items.
    const blockedItemsMap = new Map<string, DatasetUploadItemPayloadV2>()

    blockedItems.forEach((item) =>
      item.slots.forEach((file) => blockedItemsMap.set(file.file_name, file))
    )

    const blockedFileNames: string[] = []

    const fileData = uploadFiles.reduce((acc, uploadFile) => {
      const newItem = itemsMap.get(uploadFile.file.name)

      if (newItem) {
        const data = {
          teamSlug,
          datasetSlug,
          uploadId: newItem.upload_id,
          signingURL: `v2/teams/${teamSlug}/items/uploads/${newItem.upload_id}/sign`
        }
        acc.push({ uploadFile, data })
      }

      // If the item is blocked, we just set blocked to true, so store can track it.
      // This file will be skipped and counted as already uploaded.
      const blockedItem = blockedItemsMap.get(uploadFile.file.name)
      if (blockedItem) {
        const data = {
          teamSlug,
          datasetSlug,
          uploadId: blockedItem.upload_id,
          blocked: true
        }
        acc.push({ uploadFile, data })
        blockedFileNames.push(uploadFile.file.name)
      }
      return acc
    }, [] as UploadFileWithData[])

    if (blockedFileNames.length) {
      toast.warning({ meta: { title: getBlockedFilesMessage(blockedFileNames) } })
    }

    store.commit('datasetUpload/SET_FILES_DATA', fileData)
  }

  const registerV1Files = (
    uploadFiles: UploadFile[], datasetSlug: string
  ): Promise<StoreActionResponse<typeof updateDatasetData>> => {
    const payload: StoreActionPayload<typeof updateDatasetData> = {
      items: getDatasetUploadItemPayloads(
        uploadFiles,
        store.state.datasetUpload.path,
        store.state.datasetUpload.tags
      ),
      datasetSlug: datasetSlug
    }

    return store.dispatch('dataset/updateDatasetData', payload)
  }

  const registerV2Files = (
    uploadFiles: UploadFile[], datasetSlug: string
  ): Promise<StoreActionResponse<typeof updateDatasetDataV2>> => {
    const payload: StoreActionPayload<typeof updateDatasetDataV2> = {
      items: getDatasetUploadItemPayloadsV2(
        uploadFiles,
        store.state.datasetUpload.path,
        store.state.datasetUpload.tags
      ),
      datasetSlug: datasetSlug
    }

    return store.dispatch('dataset/updateDatasetDataV2', payload)
  }

  const handleRegisterFilesError = (error: ErrorWithMessage | ParsedValidationError): void => {
    // we're not really expecting or handling a validation error, as the payload
    // sent to the backend is generated by the system, not the user.
    if ('isValidationError' in error) {
      return console.warn('There were some validation errors in the response', error)
    }

    // This specific code means the user's storage is all used up, so the entire
    // batch failed to register
    if (error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      return store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
    }

    // Any other error message given by backend or parsed by frontend is
    // rendered as toast
    return toast.warning({ meta: { title: error.message } })
  }

  /**
   * Adds v1 `UploadFile[]` collection into the store
   */
  const addV1Files = async (
    dataset: Ref<DatasetPayload | null>,
    uploadFiles: UploadFile[]
  ): Promise<'success' | 'failure'> => {
    // no dataset means action is not possible
    if (!dataset.value) { return 'failure' }

    // step 1: register files on the backend. get registration data for them
    const response = await registerV1Files(uploadFiles, dataset.value.slug)

    // if step 1 fails, we end here
    if ('error' in response) {
      store.commit('datasetUpload/REMOVE_FILES', uploadFiles)
      handleRegisterFilesError(response.error)
      return 'failure'
    }

    // step 2, merge registration data with `UploadFile` records
    processV1RegistrationResponse(response.data, uploadFiles)

    return 'success'
  }

  const addV2Files = async (
    dataset: Ref<DatasetPayload | null>,
    uploadFiles: UploadFile[]
  ): Promise<'success' | 'failure'> => {
    // no dataset means action is not possible
    if (!dataset.value) { return 'failure' }

    // step 1: register files on the backend. get registration data for them
    const response = await registerV2Files(uploadFiles, dataset.value.slug)

    // if step 1 fails, we end here
    if ('error' in response) {
      store.commit('datasetUpload/REMOVE_FILES', uploadFiles)
      handleRegisterFilesError(response.error)
      return 'failure'
    }

    // step 2, merge registration data with `UploadFile` records
    processV2RegistrationResponse({
      teamSlug: dataset.value.team_slug,
      datasetSlug: dataset.value.slug,
      params: response.data,
      uploadFiles: uploadFiles
    })

    return 'success'
  }

  const startV1Upload = (): Promise<StoreActionResponse<typeof startUpload>> =>
    store.dispatch('datasetUpload/startUpload')

  const startV2Upload = (): Promise<StoreActionResponse<typeof startUploadV2>> =>
    store.dispatch('datasetUpload/startUploadV2')

  const currentUploadFile = computed(() => store.state.datasetUpload.currentUploadFile)

  const setCurrentUploadFile = (file: StoreMutationPayload<typeof SET_CURRENT_UPLOAD_FILE>): void =>
    store.commit('datasetUpload/SET_CURRENT_UPLOAD_FILE', file)

  return {
    /**
     * Register `UploadFile[]` collection with v1 dataset on backend and merge the returned
     * data with the collection in the store.
     */
    addV1Files,
    /**
     * Register `UploadFile[]` collection with v2 dataset on backend and merge the returned
     * data with the collection in the store.
     */
    addV2Files,
    createUploadFiles,
    removeUploadFiles,
    resetUploadFiles,
    setFileData,
    sets,
    startV1Upload,
    startV2Upload,
    unfinishedFiles,
    updateUploadFiles,
    uploadFiles,
    uploadInProgress,

    // configuration of videos via modal
    currentUploadFile,
    setCurrentUploadFile
  }
}
