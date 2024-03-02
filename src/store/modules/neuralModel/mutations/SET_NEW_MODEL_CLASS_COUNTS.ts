import { NeuralModelMutation } from '@/store/modules/neuralModel/types'
import { DatasetReportPayload } from '@/store/types'

type Mutation = NeuralModelMutation<DatasetReportPayload | null>
export const SET_NEW_MODEL_CLASS_COUNTS: Mutation = (state, report) => {
  state.newModelClassCounts = report
}
