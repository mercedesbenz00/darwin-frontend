import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { loadBoolean } from '@/store/persistedSettings'
import {
  AnnotationClassPayload,
  DatasetAnnotatorPayload,
  DatasetDetailPayload,
  DatasetExportPayload,
  DatasetFolderPayload,
  DatasetItemCountsPayload,
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetPayload,
  DatasetReportPayload,
  DatasetVideoPayload,
  WorkflowTemplatePayload,
  V2DatasetItemFilter,
  V2DatasetFolderPayload,
  V2DatasetItemPayload
} from '@/store/types'
import { Dataset } from '@/store/types/Dataset'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'
import { WorkforceManagerPayload } from '@/store/types/WorkforceManagerPayload'
import { WORKFLOW_FOLDER_ENABLED } from '@/utils/localStorageKeys'

import { Poller } from './types'

export type DatasetState = {
  currentDataset: Dataset
  classifications: AnnotationClassPayload[]
  annotators: DatasetAnnotatorPayload[]
  currentDatasetVideoItem: DatasetItemPayload | null
  currentPath: string | null
  datasetDetails: (DatasetDetailPayload | (DatasetItemCountsPayload & { id: number }))[]
  datasetExports: DatasetExportPayload[]
  datasetFolders: DatasetFolderPayload[]
  datasetFoldersV2: V2DatasetFolderPayload[]
  datasetTreefiedFolders: DatasetFolderPayload[]
  datasetTreefiedFoldersV2: V2DatasetFolderPayload[]
  datasetItemFilenames: DatasetItemFilenamePayload[]
  datasetItems: DatasetItemPayload[]
  datasetItemsV2: { [id: string]: V2DatasetItemPayload }
  datasetItemIdsV2: V2DatasetItemPayload['id'][]
  datasetItemsLoaded: boolean
  datasets: DatasetPayload[]
  datasetVideos: DatasetVideoPayload[]
  dataTabColumnCount: number
  dataTabColumnCountV2: number
  dataTabViewMode: VIEW_MODE
  datasetItemFilter: DatasetItemFilter
  datasetItemFilterV2: V2DatasetItemFilter
  workflowTemplates: WorkflowTemplatePayload[]
  folderEnabled: boolean
  itemsPollers: Poller[]
  pickedDataset: DatasetPayload | null
  reports: DatasetReportPayload[],
  /**
   * If `selectedAll: false`, this field holds ids of all items which are
   * currently individually selected. Any action which acts on selected items
   * will affect only items with these ids.
   *
   * If `selectedAll: false`, this field is ignored
   */
  selectedItemIds: number[],
  selectedV2ItemIds: string[],
  unselectedV2ItemIds: string[],
  /**
   * Indicates if current item selection mode is "all"
   *
   * When this mode is enabled, we assume any action related to seletion, deals
   * with all currently filtered items in the dataset and the `selectedItemIds`
   * field is effectively ignored.
   */
  selectedAll: boolean,
  workforceManagers: WorkforceManagerPayload[]
  exportCompleteCount: number
}

export const createBlankCurrentDataset = (): Dataset => ({
  slug: '',
  annotationProgress: 0,
  classCounts: [],
  id: null,
  loaded: false,
  metadata: null,
  numImages: 0,
  numVideos: 0,
  unfilteredItemCount: 0,
  size: 0,
  statusCounts: [],
  videos: [],
  team_slug: ''
})

export const getInitialState = (): DatasetState => ({
  annotators: [],
  classifications: [],
  currentDataset: createBlankCurrentDataset(),
  currentDatasetVideoItem: null,
  currentPath: null,
  datasetDetails: [],
  datasetExports: [],
  datasetItemFilenames: [],
  datasetFolders: [],
  datasetFoldersV2: [],
  datasetTreefiedFolders: [],
  datasetTreefiedFoldersV2: [],
  datasetItems: [],
  datasetItemsV2: {},
  datasetItemIdsV2: [],
  datasetItemsLoaded: false,
  datasets: [],
  datasetVideos: [],
  dataTabColumnCount: 5,
  dataTabColumnCountV2: 2,
  folderEnabled: loadBoolean(WORKFLOW_FOLDER_ENABLED, false),
  itemsPollers: [],
  pickedDataset: null,
  reports: [],
  selectedItemIds: [],
  selectedV2ItemIds: [],
  unselectedV2ItemIds: [],
  selectedAll: false,
  datasetItemFilter: {},
  datasetItemFilterV2: {},
  dataTabViewMode: VIEW_MODE.CARD,
  workflowTemplates: [],
  workforceManagers: [],
  exportCompleteCount: 0
})

// initial state
export const state: DatasetState = getInitialState()
