import { ActionTree } from 'vuex'

import { RootState, V2Workflows } from '@/store/types'

import { createConsensusChildStage } from './createConsensusChildStage'
import { createStage } from './createStage'
import { loadWorkflow } from './loadWorkflow'
import { loadWorkflows } from './loadWorkflows'
import { requestWorkBatchInWorkflow } from './requestWorkBatchInWorkflow'
import { submitWorkflow } from './submitWorkflow'

type Index = ActionTree<V2Workflows, RootState>

export const actions: Index = {
  createStage,
  createConsensusChildStage: createConsensusChildStage,
  loadWorkflows,
  loadWorkflow,
  requestWorkBatchInWorkflow,
  submitWorkflow
}
