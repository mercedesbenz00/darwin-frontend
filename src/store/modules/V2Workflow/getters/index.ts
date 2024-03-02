import { GetterTree } from 'vuex'

import { RootState, V2Workflows } from '@/store/types'

import { getStageByWorkflowIdStageId } from './getStageByWorkflowIdStageId'
import { getWorkflowByDatasetId } from './getWorkflowByDatasetId'
import { getWorkflowById } from './getWorkflowById'

export const getters: GetterTree<V2Workflows, RootState> = {
  getStageByWorkflowIdStageId,
  getWorkflowById,
  getWorkflowByDatasetId
}
