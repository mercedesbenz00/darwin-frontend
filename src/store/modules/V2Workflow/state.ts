import { V2Workflows } from '@/store/types'

export const getInitialState = (): V2Workflows => ({
  workflows: [],
  editedWorkflow: null
})

export const state: V2Workflows = getInitialState()
