import { GetterTree } from 'vuex'

import { findDatasetDetailsById } from '@/store/modules/dataset/getters/findDatasetDetailsById'
import { RootState } from '@/store/types'

import { allConsensusStagesIds } from './getters/allConsensusStagesIds'
import { allSelectedItemsArchived } from './getters/allSelectedItemsArchived'
import { annotatorsForDataset } from './getters/annotatorsForDataset'
import { currentPath } from './getters/currentPath'
import { currentPathFolder } from './getters/currentPathFolder'
import { currentPathFolderV2 } from './getters/currentPathFolderV2'
import { currentPathFolders } from './getters/currentPathFolders'
import { currentPathFoldersV2 } from './getters/currentPathFoldersV2'
import { currentPathV2 } from './getters/currentPathV2'
import { dataTabSortBy } from './getters/dataTabSortBy'
import { dataTabSortDirection } from './getters/dataTabSortDirection'
import { datasetItemApiFilter } from './getters/datasetItemApiFilter'
import { datasetItemApiFilterV2 } from './getters/datasetItemApiFilterV2'
import { defaultWorkflowTemplate } from './getters/defaultWorkflowTemplate'
import { findById } from './getters/findById'
import { findBySlug } from './getters/findBySlug'
import { findBySlugs } from './getters/findBySlugs'
import { findReportById } from './getters/findReportById'
import { isVersion2 } from './getters/isVersion2'
import { managementActionFilter } from './getters/managementActionFilter'
import { selectedItemCount } from './getters/selectedItemCount'
import { selectedItems } from './getters/selectedItems'
import { DatasetState } from './state'

// getters
export const getters: GetterTree<DatasetState, RootState> = {
  allSelectedItemsArchived,
  allConsensusStagesIds,
  annotatorsForDataset,
  currentPath,
  currentPathV2,
  currentPathFolder,
  currentPathFolders,
  currentPathFolderV2,
  currentPathFoldersV2,
  datasetItemApiFilter,
  datasetItemApiFilterV2,
  dataTabSortBy,
  dataTabSortDirection,
  defaultWorkflowTemplate,
  findById,
  findBySlug,
  findBySlugs,
  findReportById,
  managementActionFilter,
  findDatasetDetailsById,
  selectedItemCount,
  selectedItems,
  isVersion2
}
