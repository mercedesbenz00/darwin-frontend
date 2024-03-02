import {
  AutoAnnotateInferencePayload,
  InferenceData,
  parseInferenceData,
  InferenceResult
} from '@/engineCommon/backend'
import { WorkviewAction } from '@/store/modules/workview/types'
import { runInference as windRunInference } from '@/utils/wind'
import { RunInferenceResponse } from '@/utils/wind/types'

type RunInference = WorkviewAction<{
  data: InferenceData | AutoAnnotateInferencePayload
  runningSessionId: string
}, RunInferenceResponse<InferenceResult>>

const runInference: RunInference = async ({ rootState }, payload) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[workview/runInference]: Current team not set') }

  const { data, runningSessionId } = payload
  const parsedData = parseInferenceData(data)
  const params = { ...parsedData, runningSessionId, teamId: currentTeam.id }
  const response = await windRunInference<InferenceResult>(params)
  return response
}

export default runInference
