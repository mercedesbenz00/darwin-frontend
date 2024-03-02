import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

export const datasetItemApiFilter: Getter<DatasetState, RootState> =
  (state) => {
    const { path, ...filters } = state.datasetItemFilter
    const datasetItemFilter: DatasetItemFilter = {
      ...filters,
      ...(state.folderEnabled && path && { path })
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
