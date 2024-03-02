import { DatasetAction } from '@/store/modules/dataset/types'
import { AnnotationHotkeysPayload, DatasetPayload } from '@/store/types'
import { updateDataset as backendUpdateDataset } from '@/utils/backend'
import { updateDataset as tutorialUpdateDataset } from '@/utils/tutorialBackend'

type Payload = {
  dataset: DatasetPayload,
  params: {
    annotationHotkeys?: AnnotationHotkeysPayload
    annotators?: { userId: number }[]
    annotatorsCanCreateTags?: boolean,
    annotatorsCanInstantiateWorkflows?: boolean,
    anyoneCanDoubleAssign?: boolean,
    instructions?: string
    name?: string
    pdfFitPage?: boolean
    public?: boolean
    reviewersCanAnnotate?: boolean,
    workforceManagers?: { managerId?: number, invitationId?: number, userId?: number}[]
    workPrioritization?: string
    workSize?: number
  }
}
type Action = DatasetAction<Payload, DatasetPayload>

/**
 * Update an existing dataset
 */
const updateDataset: Action = async ({ commit, rootState }, payload) => {
  const { dataset, params } = payload
  const updateDatasetParams: Parameters<typeof backendUpdateDataset>[0] = {
    ...params,
    datasetId: dataset.id
  }
  const response = rootState.workview.tutorialMode
    ? tutorialUpdateDataset(updateDatasetParams)
    : await backendUpdateDataset(updateDatasetParams)

  if ('data' in response) { commit('PUSH_DATASET', response.data) }
  return response
}
export default updateDataset
