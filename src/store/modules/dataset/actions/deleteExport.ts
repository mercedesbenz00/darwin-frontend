import { DatasetAction } from '@/store/modules/dataset/types'
import {
  deleteExport as backendDeleteExport,
  DeleteExportParams
} from '@/utils/backend'

/**
 * Delete export
 */
export const deleteExport: DatasetAction<DeleteExportParams> = async ({ commit }, params) => {
  const response = await backendDeleteExport(params)
  if ('data' in response) {
    commit('DELETE_EXPORT', params.name)
  }
  return response
}
