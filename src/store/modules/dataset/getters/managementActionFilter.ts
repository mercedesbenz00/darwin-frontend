import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import {
  DatasetItemFilter,
  RootState
} from '@/store/types'

/**
 * Computes the appropirate filter to use when performing a dataset management
 * action.
 *
 * All dataset management actions either send out a filter which is a list of
 * item ids, or whichever fitler is currently being applied to the sidebar,
 * when "select all" is active
 */
export const managementActionFilter: Getter<DatasetState, RootState> = state => {
  const filter: DatasetItemFilter =
    state.selectedAll
      ? state.datasetItemFilter
      : { dataset_item_ids: state.selectedItemIds }
  return filter
}
