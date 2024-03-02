import moment from 'moment'
import { computed, Ref, SetupContext } from 'vue'
import { Location } from 'vue-router'

import { DatasetItemCardProps } from '@/components/DatasetManagement/Card/V2/types'
import { useRoute } from '@/composables/useRouter'
import store from '@/store'
import { archiveDatasetItems } from '@/store/modules/dataset/actions/archiveDatasetItems'
import { archiveV2DatasetItems } from '@/store/modules/dataset/actions/archiveV2DatasetItems'
import { restoreDatasetItems } from '@/store/modules/dataset/actions/restoreDatasetItems'
import { restoreV2DatasetItems } from '@/store/modules/dataset/actions/restoreV2DatasetItems'
import {
  AnnotationClassPayload,
  DatasetItemStatus,
  DatasetItemType,
  DatasetPayload,
  StoreActionPayload
} from '@/store/types'
import {
  addZeros,
  formatFileSize,
  resolveImageDMLocation,
  resolveItemV2Location,
  resolveSplitVideoDMLocation,
  resolveVideoWorkflowLocation
} from '@/utils'

const UNOPENABLE_VIDEO_STATUSES = [
  DatasetItemStatus.archived,
  DatasetItemStatus.uploading,
  DatasetItemStatus.error
]

const UNOPENABLE_IMAGE_STATUSES = [...UNOPENABLE_VIDEO_STATUSES, DatasetItemStatus.processing]

export interface DatasetItemSetup {
  isVideo: Ref<boolean>
  thumbnailUrl: Ref<string|null>
  fileType: Ref<string|null>
  isDicom: Ref<boolean>
  isImage: Ref<boolean>
  isPdf: Ref<boolean>
  isExternal: Ref<boolean>
  isOpenable: Ref<boolean>
  isRestorable: Ref<boolean>
  isAnnotateAsVideo: Ref<boolean>
  priority: Ref<number>
  itemLocation: Ref<Location|null>
  itemType: Ref<string>
  hasError: Ref<boolean>
  tags: Ref<AnnotationClassPayload[]>
  dimensionInfo: Ref<string>
  filesizeInfo: Ref<string>
  originalFileName: Ref<string>
  modifiedAt: Ref<string>
  date: Ref<string>
  seq: Ref<string>
  isSelected: Ref<boolean>
  selectedAll: Ref<boolean>
  selectedItemIds: Ref<number[]|string[]>
  status: Ref<DatasetItemStatus>
  onArchive: () => Promise<void>
  onRestore: () => Promise<void>
  setSelection: (e: MouseEvent, selected: boolean) => void
}

export const useDatasetItem = (
  props: DatasetItemCardProps,
  context: SetupContext
): DatasetItemSetup => {
  const route = useRoute()

  const isV2 = computed(() => {
    return !!props.dataV2
  })

  const isVideo = computed(() => {
    if (isV2.value) {
      return props.dataV2.slot_types.includes(DatasetItemType.video)
    } else {
      return !!props.data.dataset_video_id && !!props.data.dataset_video
    }
  })

  const thumbnailUrl = computed(() => {
    if (isV2.value) {
      if (props.dataV2.slots && props.dataV2.slots.length) {
        return props.dataV2.slots[0].thumbnail_url || null
      } else {
        return null
      }
    } else {
      if (isVideo.value) {
        return props.data.dataset_video!.first_frame_thumbnail_url || null
      }
      return props.data.dataset_image?.image?.thumbnail_url || null
    }
  })

  const isDicom = computed(() => {
    if (isV2.value) {
      return props.dataV2.slot_types.includes(DatasetItemType.dicom)
    } else {
      if (!isVideo.value) { return false }
      const { dataset_video: datasetVideo } = props.data
      return datasetVideo?.metadata?.type === 'dicom'
    }
  })

  const fileName = computed(() => {
    if (isV2.value) {
      return props.dataV2.slots.length ? props.dataV2.slots[0].file_name : props.dataV2.name
    }
    return props.data.filename
  })

  const fileType = computed(() => {
    const name = fileName.value
    const rawFileExtension = name.match(/\.[0-9a-z]+$/i)

    return rawFileExtension ? rawFileExtension[0] : null
  })

  const isPdf = computed(() => {
    if (isV2.value) {
      return props.dataV2.slot_types.includes(DatasetItemType.pdf)
    } else {
      if (!isVideo.value) { return false }
      const { dataset_video: datasetVideo } = props.data
      return datasetVideo?.metadata?.type === 'pdf'
    }
  })

  const isImage = computed(() => {
    if (isV2.value) {
      return props.dataV2.slot_types.includes(DatasetItemType.image)
    }
    return false
  })

  const isExternal = computed(() => {
    if (isV2.value) {
      return false
    } else {
      if (isVideo.value) {
        return !!props.data.dataset_video?.external
      }
      return !!props.data.dataset_image?.image.external
    }
  })

  const isAnnotateAsVideo = computed(() => {
    if (isV2.value) {
      return isVideo.value && (props.dataV2.status === DatasetItemStatus.annotate)
    } else {
      return isVideo.value && !!props.data.dataset_video?.annotate_as_video
    }
  })

  const isOpenable = computed(() => {
    const status = isV2.value ? props.dataV2.status : props.data.status
    if (status === DatasetItemStatus.processing) {
      // Return isOpenable as false if current video is being processed
      return false
    }
    return isVideo.value
      ? !UNOPENABLE_VIDEO_STATUSES.includes(status)
      : !UNOPENABLE_IMAGE_STATUSES.includes(status)
  })

  const isRestorable = computed(() => {
    const status = isV2.value ? props.dataV2.status : props.data.status
    return status === DatasetItemStatus.archived
  })

  const priority = computed(() => {
    return isV2.value ? props.dataV2.priority : props.data.priority
  })

  const status = computed(() => {
    return isV2.value ? props.dataV2.status : props.data.status
  })

  const itemLocation = computed(() => {
    if (isV2.value) {
      return resolveItemV2Location(route, props.dataV2)
    }
    if (isVideo.value) {
      return isAnnotateAsVideo.value
        ? resolveVideoWorkflowLocation(route, props.data)
        : resolveSplitVideoDMLocation(route, props.data)
    }

    return resolveImageDMLocation(route, props.data)
  })

  const itemType = computed(() => {
    if (!isVideo.value) { return 'image' }
    if (isAnnotateAsVideo.value) { return 'video' }
    return 'video-frames'
  })

  const hasError = computed(() => {
    const status = isV2.value ? props.dataV2.status : props.data.status
    return status === 'error'
  })

  const classesById = computed(() => {
    return store.state.aclass.classesById
  })

  const tags = computed(() => {
    if (isV2.value) {
      const itemTags = props.dataV2.tags
      return (itemTags && itemTags.map(id => classesById.value[id])) || []
    }
    return props.data.labels.map(id => classesById.value[id])
  })

  const dimensionInfo = computed(() => {
    if (isV2.value) { return '' }

    return (props.data.width && props.data.height)
      ? `${props.data.width}x${props.data.height}`
      : ''
  })

  const filesizeInfo = computed(() => {
    if (isV2.value) { return '' }
    return props.data.file_size ? formatFileSize(props.data.file_size) : ''
  })

  const originalFileName = computed(() => {
    if (isV2.value) { return props.dataV2.name }
    return isVideo.value
      ? props.data.dataset_video!.original_filename
      : props.data.filename
  })

  const modifiedAt = computed(() => {
    if (isV2.value) {
      return moment(props.dataV2.updated_at).format('DD/MM/YY')
    }
    return moment(props.data.updated_at).format('DD/MM/YY')
  })

  const date = computed(() => {
    if (isV2.value) {
      return moment(props.dataV2.updated_at).format('DD/MM/YY')
    }
    return moment(props.data.updated_at).format('DD/MM/YY')
  })

  const seq = computed(() => {
    if (isV2.value) { return '' }
    return addZeros(props.data.seq)
  })

  const currentDataset = computed(() => {
    return store.state.dataset.datasets.find(
      (d: DatasetPayload) => d.id === store.state.dataset.currentDataset.id
    )
  })

  /**
   * Called when clicking the "archive" button, which renders if item is in errored state
   *
   * Dispatches toast if user not allowed to archive, archives item otherwise
   */
  const onArchive = async (): Promise<void> => {
    if (!currentDataset.value) { return }
    if (isV2.value) {
      const params: StoreActionPayload<typeof archiveV2DatasetItems> = {
        dataset: currentDataset.value,
        filters: { item_ids: [props.dataV2.id] }
      }
      const { error } = await store.dispatch('dataset/archiveV2DatasetItems', params)
      if (error) {
        await store.dispatch('toast/warning', { content: error.message })
      }
      return
    }
    const params: StoreActionPayload<typeof archiveDatasetItems> = {
      dataset: currentDataset.value,
      filter: { dataset_item_ids: [props.data.id] }
    }
    const { error } = await store.dispatch('dataset/archiveDatasetItems', params)
    if (error) {
      await store.dispatch('toast/warning', { content: error.message })
    }
  }

  /**
   * Called when clicking the "restore" button, which renders if item is in archived state
   *
   * Dispatches toast if user not allowed to restore, restores item otherwise
   */
  const onRestore = async (): Promise<void> => {
    if (!currentDataset.value) { return }
    if (currentDataset.value && isV2.value) {
      const params: StoreActionPayload<typeof restoreV2DatasetItems> = {
        dataset: currentDataset.value,
        filters: { item_ids: [props.dataV2.id] }
      }
      const { error } = await store.dispatch('dataset/restoreV2DatasetItems', params)
      if (error) {
        await store.dispatch('toast/warning', { content: error.message })
      }
      return
    }
    const params: StoreActionPayload<typeof restoreDatasetItems> = {
      dataset: currentDataset.value,
      filter: { dataset_item_ids: [props.data.id] }
    }
    const { error } = await store.dispatch('dataset/restoreDatasetItems', params)
    if (error) {
      await store.dispatch('toast/warning', { content: error.message })
    }
  }

  const selectedAll = computed(() => {
    return store.state.dataset.selectedAll
  })

  const selectedItemIds = computed(() => {
    return isV2.value ? store.state.dataset.selectedV2ItemIds : store.state.dataset.selectedItemIds
  })

  const isSelected = computed(() => {
    if (selectedAll.value) { return true }
    if (isV2.value) {
      return store.state.dataset.selectedV2ItemIds.includes(props.dataV2.id)
    } else {
      return store.state.dataset.selectedItemIds.includes(props.data.id)
    }
  })

  const setSelection = (e: MouseEvent, selected: boolean): void => {
    if (e.shiftKey) {
      context.emit('shift-select', selected)
    } else {
      context.emit('select', selected)
    }
  }

  return {
    isVideo,
    thumbnailUrl,
    isDicom,
    isImage,
    isPdf,
    fileType,
    isExternal,
    isAnnotateAsVideo,
    isOpenable,
    isRestorable,
    priority,
    itemLocation,
    itemType,
    hasError,
    tags,
    dimensionInfo,
    filesizeInfo,
    originalFileName,
    modifiedAt,
    date,
    seq,
    selectedAll,
    selectedItemIds,
    isSelected,
    status,
    onArchive,
    onRestore,
    setSelection
  }
}
