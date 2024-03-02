import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'

export const datasetItemApiFilterV2: Getter<DatasetState, RootState> =
  (state) => {
    const { item_paths: itemPaths, ...filters } = state.datasetItemFilterV2
    const datasetItemFilter: V2DatasetItemFilter = {
      ...filters,
      ...(state.folderEnabled && itemPaths && { item_paths: itemPaths })
    }
    if (
      (
        !datasetItemFilter.statuses ||
        datasetItemFilter.statuses.length === 0
      ) &&
      (
        !datasetItemFilter.not_statuses ||
        datasetItemFilter.not_statuses.length === 0
      )
    ) {
      datasetItemFilter.statuses = [
        DatasetItemStatus.annotate,
        DatasetItemStatus.complete,
        DatasetItemStatus.error,
        DatasetItemStatus.new,
        DatasetItemStatus.processing,
        DatasetItemStatus.review,
        DatasetItemStatus.uploading
      ]
    }
    return datasetItemFilter
  }
