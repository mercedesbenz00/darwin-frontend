import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { WorkflowPayload } from '@/store/types/WorkflowPayload'

type Payload = {
  items: DatasetItemPayload[]
  status: DatasetItemStatus
}

const isWorkflowStatus = (s: DatasetItemStatus): s is WorkflowPayload['status'] =>
  s === DatasetItemStatus.annotate ||
  s === DatasetItemStatus.review ||
  s === DatasetItemStatus.complete

export const SET_ITEM_STATUS: DatasetMutation<Payload> =
  (state, { items, status }) => {
    items.forEach((item) => {
      item.status = status
      if (item.current_workflow && isWorkflowStatus(status)) {
        item.current_workflow.status = status
      }
    })
  }
