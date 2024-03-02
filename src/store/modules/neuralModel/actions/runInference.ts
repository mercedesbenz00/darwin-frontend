import { InferenceResult } from '@/engineCommon/backend'
import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { runInference as windRunInference } from '@/utils/wind'
import { RunningSessionPayload, RunInferenceResponse } from '@/utils/wind/types'

export type ModelInferenceParams = {
}

type RunInference = NeuralModelAction<
  { runningSession: RunningSessionPayload, image: { base64: string } },
  RunInferenceResponse<InferenceResult[]>
>
export const runInference: RunInference = async ({ rootState }, payload) => {
  const currentTeam = rootState.team.currentTeam
  if (!currentTeam) { throw new Error('[neuralModel/runInference]: Current team not set') }
  const { runningSession, image } = payload

  const response = await windRunInference<InferenceResult[]>({
    image,
    runningSessionId: runningSession.id,
    teamId: currentTeam.id
  })

  return response
}
