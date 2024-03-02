import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

type Payload = {
  items: DatasetItemPayload[]
  stageNumber: number
}

export const SET_STAGE_NUMBER: DatasetMutation<Payload> =
  (state, { items, stageNumber }) => {
    items.forEach((item) => {
      if (!item.current_workflow) { return }
      item.current_workflow.current_stage_number = stageNumber
    })
  }
