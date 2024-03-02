import { DatasetAction, ExportV2Params } from '@/store/modules/dataset/types'
import { exportV2Dataset as backendExportDataset } from '@/utils/backend'

type BackendParams = Parameters<typeof backendExportDataset>[0]

export const exportV2Dataset: DatasetAction<ExportV2Params> = async (_, params) => {
  const backendParams: BackendParams = {
    annotation_filter: params.annotationFilter,
    dataset_slug: params.datasetSlug,
    filter: params.filters,
    format: params.format,
    include_authorship: params.includeAuthorship,
    include_export_token: params.includeExportToken,
    name: params.name,
    team_slug: params.teamSlug
  }
  const response = await backendExportDataset(backendParams)
  return response
}
