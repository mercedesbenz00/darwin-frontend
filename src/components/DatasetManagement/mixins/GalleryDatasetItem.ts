import moment from 'moment'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import { archiveDatasetItems } from '@/store/modules/dataset/actions/archiveDatasetItems'
import { restoreDatasetItems } from '@/store/modules/dataset/actions/restoreDatasetItems'
import {
  AnnotationClassPayload,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  RootState,
  StoreActionPayload
} from '@/store/types'
import {
  addZeros,
  formatFileSize,
  resolveImageDMLocation,
  resolveSplitVideoDMLocation,
  resolveVideoWorkflowLocation
} from '@/utils'

const UNOPENABLE_VIDEO_STATUSES = [
  DatasetItemStatus.archived,
  DatasetItemStatus.uploading,
  DatasetItemStatus.error
]

const UNOPENABLE_IMAGE_STATUSES = [...UNOPENABLE_VIDEO_STATUSES, DatasetItemStatus.processing]

/**
 * Mixin used to provide computed data & vuex actions for dataset item on Gallery in Card/List mode
 */
@Component
export default class GalleryDatasetItem extends Vue {
  @Prop({ required: true })
  data!: DatasetItemPayload

  @State((state: RootState) => state.aclass.classesById)
  classesById!: Record<number, AnnotationClassPayload>

  @State((state: RootState) =>
    state.dataset.datasets.find((d: DatasetPayload) => d.id === state.dataset.currentDataset.id)
  )
  currentDataset!: DatasetPayload

  get isVideo (): boolean {
    return !!this.data.dataset_video_id && !!this.data.dataset_video
  }

  get thumbnailUrl (): string | null {
    if (this.isVideo) {
      return this.data.dataset_video!.first_frame_thumbnail_url
    }
    return this.data.dataset_image?.image?.thumbnail_url || null
  }

  get isDicom (): boolean {
    if (!this.isVideo) {
      return false
    }
    const { dataset_video: datasetVideo } = this.data
    return datasetVideo?.metadata?.type === 'dicom'
  }

  get isPdf (): boolean {
    if (!this.isVideo) {
      return false
    }
    const { dataset_video: datasetVideo } = this.data
    return datasetVideo?.metadata?.type === 'pdf'
  }

  get isExternal (): boolean {
    if (this.isVideo) {
      return !!this.data.dataset_video?.external
    }
    return !!this.data.dataset_image?.image.external
  }

  get isOpenable (): boolean {
    // A proper playback video still being processed cannot be opened
    // A split video OTOH, can be openned, as frames are processed and annotated individually
    if (this.isAnnotateAsVideo && this.data.status === DatasetItemStatus.processing) {
      return false
    }

    return this.isVideo
      ? !UNOPENABLE_VIDEO_STATUSES.includes(this.data.status)
      : !UNOPENABLE_IMAGE_STATUSES.includes(this.data.status)
  }

  get isRestorable (): boolean {
    return this.data.status === DatasetItemStatus.archived
  }

  /**
   * readonly prop to show if the current dataset item is in annotate_as_video mode or not
   */
  get isAnnotateAsVideo (): boolean {
    return this.isVideo && !!this.data.dataset_video?.annotate_as_video
  }

  get priority (): number {
    return this.data.priority
  }

  /**
   * Called when clicking "open" button
   *
   * Shows toast if user not allowed to open, navigates to workview otherwise
   */
  get itemLocation (): Location {
    const { $route, data, isAnnotateAsVideo, isVideo } = this

    if (isVideo) {
      return isAnnotateAsVideo
        ? resolveVideoWorkflowLocation($route, data)
        : resolveSplitVideoDMLocation($route, data)
    }

    return resolveImageDMLocation($route, data)
  }

  get itemType (): 'image' | 'video' | 'video-frames' {
    if (!this.isVideo) {
      return 'image'
    }
    if (this.isAnnotateAsVideo) {
      return 'video'
    }
    return 'video-frames'
  }

  get hasError (): boolean {
    return this.data.status === 'error'
  }

  get tags (): AnnotationClassPayload[] {
    return (this.data.labels && this.data.labels.map(id => this.classesById[id])) || []
  }

  get dimensionInfo (): string {
    return this.data.width && this.data.height ? `${this.data.width}x${this.data.height}` : ''
  }

  get filesizeInfo (): string {
    return this.data.file_size ? formatFileSize(this.data.file_size) : ''
  }

  get originalFileName (): string {
    return this.isVideo ? this.data.dataset_video!.original_filename : this.data.filename
  }

  get modifiedAt (): string {
    return moment(this.data.updated_at).format('DD/MM/YY')
  }

  get date (): string {
    return moment(this.data.updated_at).format('DD/MM/YY')
  }

  get seq (): string {
    return addZeros(this.data.seq)
  }

  /**
   * Called when clicking the "archive" button, which renders if item is in errored state
   *
   * Dispatches toast if user not allowed to archive, archives item otherwise
   */
  async onArchive (): Promise<void> {
    const { currentDataset } = this
    const params: StoreActionPayload<typeof archiveDatasetItems> = {
      dataset: currentDataset,
      filter: { dataset_item_ids: [this.data.id] }
    }
    const { error } = await this.$store.dispatch('dataset/archiveDatasetItems', params)
    if (error) {
      await this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  /**
   * Called when clicking the "restore" button, which renders if item is in archived state
   *
   * Dispatches toast if user not allowed to restore, restores item otherwise
   */
  async onRestore (): Promise<void> {
    const { currentDataset } = this
    const params: StoreActionPayload<typeof restoreDatasetItems> = {
      dataset: currentDataset,
      filter: { dataset_item_ids: [this.data.id] }
    }
    const { error } = await this.$store.dispatch('dataset/restoreDatasetItems', params)
    if (error) {
      await this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  // selection

  @State((state: RootState) => state.dataset.selectedAll)
  selectedAll!: boolean

  @State((state: RootState) => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  get isSelected (): boolean {
    return this.selectedAll || this.selectedItemIds.includes(this.data.id)
  }

  setSelection (e: MouseEvent, selected: boolean): void {
    if (e.shiftKey) {
      this.$emit('shift-select', selected)
    } else {
      this.$emit('select', selected)
    }
  }
}
