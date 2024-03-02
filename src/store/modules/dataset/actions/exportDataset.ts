import { DatasetAction, ExportDatasetParams } from '@/store/modules/dataset/types'
import { exportDataset as backendExportDataset } from '@/utils/backend'

type BackendParams = Parameters<typeof backendExportDataset>[0]

export const exportDataset: DatasetAction<ExportDatasetParams> = async (_, params) => {
  const backendParams: BackendParams = {
    annotation_filter: params.annotationFilter,
    dataset_id: params.datasetId,
    filter: params.filter,
    format: params.format,
    include_authorship: params.includeAuthorship,
    include_export_token: params.includeExportToken,
    name: params.name
  }
  const response = await backendExportDataset(backendParams)
  return response
}
